import * as T from '@/scripts/types.ts';
import { round, arrayCompare, extractParetoFrontier, product } from '@/scripts/utils.ts';
import { getEffects, copyItem } from '@/scripts/artifacts.ts';



type BaseBonuses = {
    PECount: number,
    SECount: number,
    basePEBonus: number,
    baseSEBonus: number,
    baseRCBonus: number,
};

type Bonuses = {
    PEBonus: number,
    SEBonus: number,
    RCBonus: number,
    EVBonus: number, // laying rate bonus and boost effectiveness are treated as eggValueBonus
    AEBonus: number,
    CRBonus: number,
};

type AnnotatedArtifact = {
    artifacts: T.Artifact[],
    bonuses: Bonuses,
    stoneSlotAmount: number,
};

type AnnotatedStone = {
    stone: T.Stone,
    bonuses: Bonuses,
};

export type ArtifactSet = {
    set: (T.Artifact | null)[],
    bonuses: Bonuses,
    userEB: number,
    ebMultiplier: number,
    onlineMultiplier: number,
    offlineMultiplier: number,
    totalOnlineMultiplier: number,
    totalOfflineMultiplier: number,
    researchCostBonus: number,
};


export function searchEBSet(items: T.Item[],
                            maxSlot: number,
                            baseBonuses: BaseBonuses,
                            countCube: boolean,
                            countMonocle: boolean,
                            online: boolean,
                            reslotting: boolean): ArtifactSet {
    return search1(items, maxSlot, baseBonuses, countCube, countMonocle, online, reslotting,
                   getEBStoneQueue,
                   (eb, bonus, cr) => [round(eb), round((1 + eb)*bonus), 1/cr]);
}


export function searchEarningSet(items: T.Item[],
                                 maxSlot: number,
                                 baseBonuses: BaseBonuses,
                                 countCube: boolean,
                                 countMonocle: boolean,
                                 online: boolean,
                                 reslotting: boolean): ArtifactSet {
    return search1(items, maxSlot, baseBonuses, countCube, countMonocle, online, reslotting,
                   getEarningStoneQueue,
                   (eb, bonus, cr) => [round((1 + eb)*bonus), 1/cr]);
}


export function searchMirrorSet(items: T.Item[],
                                maxSlot: number,
                                baseBonuses: BaseBonuses,
                                countCube: boolean,
                                countMonocle: boolean,
                                online: boolean,
                                reslotting: boolean): ArtifactSet {
    return search1(items, maxSlot, baseBonuses, countCube, countMonocle, online, reslotting,
                   getMirrorStoneQueue,
                   (eb, bonus, cr) => [round(bonus), round((1 + eb)*bonus), 1/cr]);
}


export function searchCube(items: T.Item[]): [T.Artifact | null, number] {
    return items.reduce<[T.Artifact | null, number]>((best, item) => {
        if (item.category !== T.ItemCategory.ARTIFACT) return best;
        const bonus = getEffects(item, false)?.['research_cost_bonus'] ?? 1;
        return bonus < best[1] ? [item, bonus] : best;
    }, [null, 1]);
}


/*
 * First layer of recursive search
 * set up variables and handle Book and Vial iteration.
 * These artifact are separated because they potentially interfere with stone effects.
 */
function search1(items: T.Item[],
                 maxSlot: number,
                 baseBonuses: BaseBonuses,
                 countCube: boolean,
                 countMonocle: boolean,
                 online: boolean,
                 reslotting: boolean,
                 stoneQueueFn: (stones: Map<T.StoneFamily, AnnotatedStone[]>,
                                baseBonuses: BaseBonuses,
                                online: boolean) => AnnotatedStone[],
                 evalBonusFn: (eb: number, bonus: number, cr: number) => number[],
                       ): ArtifactSet {
    const { PECount, SECount, basePEBonus, baseSEBonus, baseRCBonus } = baseBonuses;

    const artifactsByFamily: Map<T.ArtifactFamily, AnnotatedArtifact[]> =
                            getArtifacts(items, !reslotting, countMonocle);
    artifactsByFamily.forEach((artifacts, key) => {
        const filtered = artifacts.filter(x => (reslotting && x.stoneSlotAmount > 0)
                                            || x.bonuses.PEBonus > 0
                                            || x.bonuses.SEBonus > 0
                                            || x.bonuses.RCBonus > 0
                                            || x.bonuses.EVBonus > 1
                                            || x.bonuses.AEBonus > 1
                                            || x.bonuses.CRBonus < 1);
        filtered.sort((a,b) => b.stoneSlotAmount - a.stoneSlotAmount
                            || b.bonuses.PEBonus - a.bonuses.PEBonus
                            || b.bonuses.SEBonus - a.bonuses.SEBonus
                            || b.bonuses.EVBonus - a.bonuses.EVBonus
                            || a.bonuses.CRBonus - b.bonuses.CRBonus
                            || b.bonuses.RCBonus - a.bonuses.RCBonus
                            || b.bonuses.AEBonus - a.bonuses.AEBonus);

        artifactsByFamily.set(key, filtered);
    });
    const artifactBooks: AnnotatedArtifact[] = artifactsByFamily.get(T.ArtifactFamily.BOOK_OF_BASAN) ?? [];
    const artifactVials: AnnotatedArtifact[] = artifactsByFamily.get(T.ArtifactFamily.VIAL_OF_MARTIAN_DUST) ?? [];
    const artifactOthers: AnnotatedArtifact[][] = Array.from(artifactsByFamily.entries())
                                                   .filter(([key]) => key !== T.ArtifactFamily.BOOK_OF_BASAN
                                                                   && key !== T.ArtifactFamily.VIAL_OF_MARTIAN_DUST)
                                                   .map(([, value]) => value);


    const stonesByFamily: Map<T.StoneFamily, AnnotatedStone[]> = getStones(items);


    const best: AnnotatedArtifact[] = [];
    const bestScore: number[] = [];

    for (const artifactBook of [...artifactBooks, null]) {
        const bookBonus = artifactBook?.bonuses.PEBonus ?? 0;

        for (const artifactVial of [...artifactVials, null]) {
            const vialBonus = artifactVial?.bonuses.RCBonus ?? 0;

            const newBaseBonuses: BaseBonuses = {
                ...baseBonuses,
                basePEBonus: baseBonuses.basePEBonus + bookBonus,
                baseRCBonus: baseBonuses.baseRCBonus + vialBonus,
            };
            const stoneQueue = reslotting ? stoneQueueFn(stonesByFamily, newBaseBonuses, online) : [];

            function evalFn(set: AnnotatedArtifact[]): number[] {
                const stoneSlotAmount = set.reduce((tot, x) => tot + x.stoneSlotAmount, 0);

                const { PEBonus, SEBonus, RCBonus, EVBonus, AEBonus, CRBonus }: Bonuses =
                    getBonus(set, stoneQueue.slice(0, stoneSlotAmount));

                const eb = SECount
                         * (baseSEBonus + SEBonus)
                         * Math.pow(basePEBonus + PEBonus, PECount);

                const bonus = EVBonus
                            * (online ? baseRCBonus + RCBonus : AEBonus)
                            / (countCube ? CRBonus : 1);

                return evalBonusFn(eb, bonus, CRBonus);
            }

            function evalUpperBoundFn(set: AnnotatedArtifact[]): number[] {
                const extraStoneAmount = (maxSlot - set.length)*3;
                const stoneAmount = set.reduce((tot, x) => tot + x.stoneSlotAmount, 0) + extraStoneAmount;

                let { PEBonus, SEBonus, RCBonus, EVBonus, AEBonus, CRBonus }: Bonuses =
                    getBonus(set, stoneQueue.slice(0, stoneAmount));

                if (!reslotting) {
                    PEBonus += extraStoneAmount*0.0015;
                    SEBonus += extraStoneAmount*0.25;
                    RCBonus += extraStoneAmount*100;
                    EVBonus *= 1.1**extraStoneAmount;
                    AEBonus *= 1.4**extraStoneAmount;
                }
                if (!hasFamily(set, T.ArtifactFamily.DEMETERS_NECKLACE)) EVBonus *= 3;
                if (!hasFamily(set, T.ArtifactFamily.TUNGSTEN_ANKH    )) EVBonus *= 2.5;
                if (!hasFamily(set, T.ArtifactFamily.QUANTUM_METRONOME)) EVBonus *= 1.35;
                if (!hasFamily(set, T.ArtifactFamily.DILITHIUM_MONOCLE)) EVBonus *= 1.3;
                if (!hasFamily(set, T.ArtifactFamily.LUNAR_TOTEM      )) AEBonus *= 200;
                if (!hasFamily(set, T.ArtifactFamily.PUZZLE_CUBE      )) CRBonus *= 0.4;

                const eb = SECount
                         * (baseSEBonus + SEBonus)
                         * Math.pow(basePEBonus + PEBonus, PECount);

                const bonus = EVBonus
                            * (online ? baseRCBonus + RCBonus : AEBonus)
                            / (countCube ? CRBonus : 1);

                return evalBonusFn(eb, bonus, CRBonus);
            }

            const current: AnnotatedArtifact[] = [artifactBook, artifactVial].filter(x => x !== null);
            search2(artifactOthers, 0, maxSlot, evalFn, evalUpperBoundFn, current, best, bestScore);
        }
    }

    const newBaseBonuses: BaseBonuses = {
        ...baseBonuses,
        basePEBonus: baseBonuses.basePEBonus + best.reduce((tot, cur) => tot + cur.bonuses.PEBonus, 0),
        baseRCBonus: baseBonuses.baseRCBonus + best.reduce((tot, cur) => tot + cur.bonuses.RCBonus, 0),
    };
    const stones = reslotting ? stoneQueueFn(stonesByFamily, newBaseBonuses, online) : [];
    stones.splice(best.reduce((tot, cur) => tot + (cur.stoneSlotAmount ?? 0), 0));
    const result: Partial<ArtifactSet> = {
        set: reslotting ? searchBestStoneAssignment(best, stones) : best.map(x => x.artifacts[0]),
        bonuses: getBonus(best, stones),
    };
    result.set!.sort((a,b) => a!.family - b!.family);
    while (result.set!.length < maxSlot) result.set!.push(null);
    attachMultipliers(result, baseBonuses);
    return result as ArtifactSet;
}


/*
 * Second layer of recursive search
 * handle all remaining families
 */
function search2(artifacts: AnnotatedArtifact[][], artifactsIdx: number = 0,
                 maxSlot: number,
                 evalFn: (arg0: AnnotatedArtifact[]) => number[],
                 evalUpperBoundFn: (arg0: AnnotatedArtifact[]) => number[],
                 current: AnnotatedArtifact[] = [],
                 best   : AnnotatedArtifact[] = [], bestScore: number[] = [],
                ): AnnotatedArtifact[] {
    const currentScore = evalFn(current);
    if (arrayCompare(bestScore, currentScore) < 0) {
        Object.assign(best, current);
        Object.assign(bestScore, currentScore);
    }

    if (current.length >= maxSlot || artifactsIdx >= artifacts.length) {
        // We filled out set, or we don't have more artifacts to add
        return best;
    }

    const scoreUpperBound = evalUpperBoundFn(current);
    if (arrayCompare(scoreUpperBound, bestScore) < 0) {
        // We can't do better than our best, no need to search further
        return best;
    }

    // Try every artifact of current family
    for (let i = 0; i < artifacts[artifactsIdx].length; i++) {
        const newCurrent = [...current, artifacts[artifactsIdx][i]];
        search2(artifacts, artifactsIdx+1, maxSlot, evalFn, evalUpperBoundFn, newCurrent, best, bestScore);
    }

    // Try without this family
    search2(artifacts, artifactsIdx+1, maxSlot, evalFn, evalUpperBoundFn, current, best, bestScore);

    return best;
}


/*
 * Helper for testing if a family is already present in a set
 */
function hasFamily(set: AnnotatedArtifact[], family: T.ArtifactFamily): boolean {
    return set.some(x => x.artifacts[0].family === family);
    //return set.some(x => x.artifacts.some(y => y.family === family));
}


/*
 * Group artifacts by families, and annotate them with bonus properties
 */
function getArtifacts(items: T.Item[],
                      includeStones: boolean,
                      countMonocle: boolean
                     ): Map<T.ArtifactFamily, AnnotatedArtifact[]> {
    const result = new Map<T.ArtifactFamily, AnnotatedArtifact[]>();

    items.forEach((item: T.Item) => {
        if (item.category !== T.ItemCategory.ARTIFACT) return;
        const artifact = copyItem(item) as T.Artifact;

        const {
            prophecy_egg_bonus    : prophecyEggBonus    = 0,
            soul_egg_bonus        : soulEggBonus        = 0,
            egg_value_bonus       : eggValueBonus       = 1,
            laying_bonus          : layingBonus         = 1,
            boost_bonus           : boostBonus          = 1,
            running_chicken_bonus : runningChickenBonus = 0,
            away_earning_bonus    : awayEarningBonus    = 1,
            research_cost_bonus   : researchCostBonus   = 1,
        } = getEffects(artifact, includeStones);

        const annotatedArtifact: AnnotatedArtifact = {
            artifacts: [artifact],
            bonuses: {
                PEBonus: round(prophecyEggBonus),
                SEBonus: round(soulEggBonus),
                EVBonus: round(eggValueBonus*layingBonus*(countMonocle ? boostBonus : 1)),
                RCBonus: round(runningChickenBonus),
                AEBonus: round(awayEarningBonus),
                CRBonus: round(researchCostBonus),
            },
            stoneSlotAmount: artifact.stones?.length ?? 0,
        };

        if (!result.has(artifact.family)) {
            result.set(artifact.family, []);
        }
        result.get(artifact.family)!.push(annotatedArtifact);
    });

    // Filter out dominated artifacts, and group equivalent ones
    result.forEach((artifacts, key) => {
        const paretoFrontier = extractParetoFrontier(artifacts.map(x => [[
            x.stoneSlotAmount,
            x.bonuses.PEBonus,
            x.bonuses.SEBonus,
            x.bonuses.RCBonus,
            x.bonuses.EVBonus,
            x.bonuses.AEBonus,
            x.bonuses.CRBonus],
            x]));
        result.set(key, paretoFrontier.map(g => ({
            artifacts: g.map(x => x.artifacts[0]),
            bonuses: g[0].bonuses,
            stoneSlotAmount: g[0].stoneSlotAmount,
        })));
    });

    return result;
}


/*
 * Group stones by families, annotate them with bonus properties and sort them by priority
 */
function getStones(items: T.Item[],
                   activeBirdFeed: boolean = false,
                   maxAmount: number = 12,
                  ): Map<T.StoneFamily, AnnotatedStone[]> {
    const result = new Map<T.StoneFamily, AnnotatedStone[]>();

    function addItem(item: T.Item) {
        if (item.category !== T.ItemCategory.STONE) return;
        const stone = copyItem(item) as T.Stone;

        const {
            prophecy_egg_bonus    : prophecyEggBonus    = 0,
            soul_egg_bonus        : soulEggBonus        = 0,
            egg_value_bonus       : eggValueBonus       = 1,
            laying_bonus          : layingBonus         = 1,
            boost_bonus           : boostBonus          = 1,
            running_chicken_bonus : runningChickenBonus = 0,
            away_earning_bonus    : awayEarningBonus    = 1,
            research_cost_bonus   : researchCostBonus   = 1,
        } = getEffects(stone);

        const annotatedStone: AnnotatedStone = {
            stone,
            bonuses: {
                PEBonus: round(prophecyEggBonus),
                SEBonus: round(soulEggBonus),
                EVBonus: round(eggValueBonus*layingBonus*(activeBirdFeed ? boostBonus : 1)),
                RCBonus: round(runningChickenBonus),
                AEBonus: round(awayEarningBonus),
                CRBonus: round(researchCostBonus),
            },
        };

        if (!result.has(stone.family)) {
            result.set(stone.family, []);
        }
        result.get(stone.family)!.push(...Array(Math.min(item.quantity ?? 1, maxAmount)).fill(annotatedStone));
    }

    items.forEach((item: T.Item) => {
        addItem(item);
        if (item.category === T.ItemCategory.ARTIFACT) {
            (item as T.Artifact).stones?.forEach(stone => stone && addItem(stone));
        }
    });

    // Sort in priority order (higher tiers first) and keep only maxAmount of them
    result.forEach((stones, key) => stones.sort((a,b) => b.stone.tier - a.stone.tier).splice(maxAmount));

    return result;
}


function getEBStoneQueue(stonesByFamily: Map<T.StoneFamily, AnnotatedStone[]>,
                         baseBonuses: BaseBonuses,
                         online: boolean): AnnotatedStone[] {
    const { PECount, SECount, basePEBonus, baseSEBonus, baseRCBonus } = baseBonuses;
    // Create priority queues for relevant stone families
    // and a list of marginal gains. …Marginals[i] is the marginal gain of the stone at index i
    const prophecyStoneQueue = stonesByFamily.get(T.StoneFamily.PROPHECY_STONE) ?? [];
    const prophecyStoneMarginals: number[] = [];
    {
        let cumul = basePEBonus;
        for (const stone of prophecyStoneQueue) {
            const eff = getEffects(stone.stone)['prophecy_egg_bonus'];
            prophecyStoneMarginals.push(Math.pow(1 + eff/cumul, PECount));
            cumul += eff;
        }
    }

    const soulStoneQueue = stonesByFamily.get(T.StoneFamily.SOUL_STONE) ?? [];
    const soulStoneMarginals: number[] = [];
    {
        let cumul = baseSEBonus;
        for (const stone of soulStoneQueue) {
            const eff = getEffects(stone.stone)['soul_egg_bonus'];
            soulStoneMarginals.push(1 + eff/cumul);
            cumul += eff;
        }
    }

    // Merge different families to single queues
    return mergeStoneQueues([
        { queue: prophecyStoneQueue, marginals: prophecyStoneMarginals },
        { queue: soulStoneQueue    , marginals: soulStoneMarginals     },
    ]);
}


function getEarningStoneQueue(stonesByFamily: Map<T.StoneFamily, AnnotatedStone[]>,
                              baseBonuses: BaseBonuses,
                              online: boolean
                             ): AnnotatedStone[] {
    const { PECount, SECount, basePEBonus, baseSEBonus, baseRCBonus } = baseBonuses;
    // Create priority queues for relevant stone families
    // and a list of marginal gains. …Marginals[i] is the marginal gain of the stone at index i
    const prophecyStoneQueue = stonesByFamily.get(T.StoneFamily.PROPHECY_STONE) ?? [];
    const prophecyStoneMarginals: number[] = [];
    {
        let cumul = basePEBonus;
        for (const stone of prophecyStoneQueue) {
            const eff = getEffects(stone.stone)['prophecy_egg_bonus'];
            prophecyStoneMarginals.push(Math.pow(1 + eff/cumul, PECount));
            cumul += eff;
        }
    }

    const soulStoneQueue = stonesByFamily.get(T.StoneFamily.SOUL_STONE) ?? [];
    const soulStoneMarginals: number[] = [];
    {
        let cumul = baseSEBonus;
        for (const stone of soulStoneQueue) {
            const eff = getEffects(stone.stone)['soul_egg_bonus'];
            soulStoneMarginals.push(1 + eff/cumul);
            cumul += eff;
        }
    }

    const terraStoneQueue = stonesByFamily.get(T.StoneFamily.TERRA_STONE) ?? [];
    const terraStoneMarginals: number[] = [];
    {
        let cumul = baseRCBonus;
        for (const stone of terraStoneQueue) {
            const eff = getEffects(stone.stone)['running_chicken_bonus'];
            terraStoneMarginals.push(1 + eff/cumul);
            cumul += eff;
        }
    }

    const tachyonStoneQueue = stonesByFamily.get(T.StoneFamily.TACHYON_STONE) ?? [];
    const tachyonStoneMarginals: number[] = [];
    for (const stone of tachyonStoneQueue) {
        const eff = getEffects(stone.stone)['laying_bonus'];
        tachyonStoneMarginals.push(eff);
    }

    const shellStoneQueue = stonesByFamily.get(T.StoneFamily.SHELL_STONE) ?? [];
    const shellStoneMarginals: number[] = [];
    for (const stone of shellStoneQueue) {
        const eff = getEffects(stone.stone)['egg_value_bonus'];
        shellStoneMarginals.push(eff);
    }

    const lunarStoneQueue = stonesByFamily.get(T.StoneFamily.LUNAR_STONE) ?? [];
    const lunarStoneMarginals: number[] = [];
    for (const stone of lunarStoneQueue) {
        const eff = getEffects(stone.stone)['away_earning_bonus'];
        lunarStoneMarginals.push(eff);
    }



    // Merge different families to single queues
    return mergeStoneQueues([
        { queue: prophecyStoneQueue, marginals: prophecyStoneMarginals },
        { queue: soulStoneQueue    , marginals: soulStoneMarginals     },
        { queue: tachyonStoneQueue , marginals: tachyonStoneMarginals  },
        { queue: shellStoneQueue   , marginals: shellStoneMarginals    },
        (online ? { queue: terraStoneQueue   , marginals: terraStoneMarginals }
                : { queue: lunarStoneQueue   , marginals: lunarStoneMarginals })
    ]);
}


function getMirrorStoneQueue(stonesByFamily: Map<T.StoneFamily, AnnotatedStone[]>,
                              baseBonuses: BaseBonuses,
                              online: boolean
                             ): AnnotatedStone[] {
    const { PECount, SECount, basePEBonus, baseSEBonus, baseRCBonus } = baseBonuses;
    // Create priority queues for relevant stone families
    // and a list of marginal gains. …Marginals[i] is the marginal gain of the stone at index i
    const terraStoneQueue = stonesByFamily.get(T.StoneFamily.TERRA_STONE) ?? [];
    const terraStoneMarginals: number[] = [];
    {
        let cumul = baseRCBonus;
        for (const stone of terraStoneQueue) {
            const eff = getEffects(stone.stone)['running_chicken_bonus'];
            terraStoneMarginals.push(1 + eff/cumul);
            cumul += eff;
        }
    }

    const tachyonStoneQueue = stonesByFamily.get(T.StoneFamily.TACHYON_STONE) ?? [];
    const tachyonStoneMarginals: number[] = [];
    for (const stone of tachyonStoneQueue) {
        const eff = getEffects(stone.stone)['laying_bonus'];
        tachyonStoneMarginals.push(eff);
    }

    const shellStoneQueue = stonesByFamily.get(T.StoneFamily.SHELL_STONE) ?? [];
    const shellStoneMarginals: number[] = [];
    for (const stone of shellStoneQueue) {
        const eff = getEffects(stone.stone)['egg_value_bonus'];
        shellStoneMarginals.push(eff);
    }

    const lunarStoneQueue = stonesByFamily.get(T.StoneFamily.LUNAR_STONE) ?? [];
    const lunarStoneMarginals: number[] = [];
    for (const stone of lunarStoneQueue) {
        const eff = getEffects(stone.stone)['away_earning_bonus'];
        lunarStoneMarginals.push(eff);
    }


    // Merge different families to single queues
    return mergeStoneQueues([
        { queue: tachyonStoneQueue , marginals: tachyonStoneMarginals  },
        { queue: shellStoneQueue   , marginals: shellStoneMarginals    },
        (online ? { queue: terraStoneQueue   , marginals: terraStoneMarginals }
                : { queue: lunarStoneQueue   , marginals: lunarStoneMarginals })
    ]);
}


function mergeStoneQueues(inputs: {queue: AnnotatedStone[], marginals: number[]}[], queueSize: number = 12) {
    const stoneQueue: AnnotatedStone[] = [];
    const stoneMarginals: number[] = [];

    const indices = inputs.map(() => 0);

    while (stoneQueue.length < queueSize) {
        let candidateIndex = -1;
        let candidateMarginal: number | null = null;

        // Find the input with the highest marginal
        for (let i = 0; i < inputs.length; i++) {
            if (inputs[i].queue.length <= indices[i]) continue;

            const currentMarginal = inputs[i].marginals[indices[i]];
            if (candidateMarginal === null || currentMarginal > candidateMarginal) {
                candidateMarginal = currentMarginal;
                candidateIndex = i;
            }
        }

        // None found, we're done
        if (candidateIndex === -1) break;

        // Add the selected stone and its marginal to the result
        stoneQueue.push(inputs[candidateIndex].queue[indices[candidateIndex]]);
        stoneMarginals.push(inputs[candidateIndex].marginals[indices[candidateIndex]]);
        indices[candidateIndex]++;
    }

    return stoneQueue;
}


function getBonus(artifacts: AnnotatedArtifact[], stones: AnnotatedStone[] = []): Bonuses {
    const result = { PEBonus: 0, SEBonus: 0, RCBonus: 0, EVBonus: 1, AEBonus: 1, CRBonus: 1 };

    [...artifacts, ...stones].forEach(item => {
        const b = item.bonuses;
        result.PEBonus += b.PEBonus;
        result.SEBonus += b.SEBonus;
        result.RCBonus += b.RCBonus;
        result.EVBonus *= b.EVBonus;
        result.AEBonus *= b.AEBonus;
        result.CRBonus *= b.CRBonus;
    });

    return result;
}


function searchBestStoneAssignment(artifacts: AnnotatedArtifact[], stones: AnnotatedStone[]): T.Artifact[] {
    let best: T.Artifact[] | null = null;
    let bestScore: number = Infinity;
    for (const candidateSet of product(...artifacts.map(x => x.artifacts))) {
        const reslottedSet: T.Artifact[] = candidateSet.map(x => copyItem(x) as T.Artifact);
        const score = assignStones(reslottedSet, stones.map(x => x.stone));
        if (score < bestScore) {
            best = reslottedSet;
            bestScore = score;
        }
    }
    return best !== null ? best : [];
}


function assignStones(set: T.Artifact[], stones: T.Stone[]): number {
    const stoneKey = (s: T.Stone | null) => s ? `${s.category}-${s.family}-${s.tier}` : "null";

    const stoneCount = new Map<string, number>();
    for (const stone of stones) {
        const key = stoneKey(stone);
        stoneCount.set(key, (stoneCount.get(key) || 0) + 1);
    }

    const slotsToFill: Array<{ artifact: T.Artifact; index: number }> = [];

    for (const artifact of set) {
        for (let i = 0; i < (artifact.stones?.length ?? 0); i++) {
            const key = stoneKey(artifact.stones[i]);
            if ((stoneCount.get(key) || 0) > 0) {
                // Stone to keep
                stoneCount.set(key, stoneCount.get(key)! - 1);
            } else {
                // Stone to change
                slotsToFill.push({ artifact, index: i });
            }
        }
    }

    const reslottedCount = slotsToFill.length;

    const remainingStones: T.Stone[] = [];
    for (const stone of stones) {
        const key = stoneKey(stone);
        if ((stoneCount.get(key) || 0) > 0) {
            remainingStones.push(stone);
            stoneCount.set(key, stoneCount.get(key)! - 1);
        }
    }

    for (let i = 0; i < slotsToFill.length; i++) {
        const { artifact, index } = slotsToFill[i];
        artifact.stones[index] = remainingStones[i];
        artifact.reslotted = (artifact.reslotted ?? 0) + 1;
    }

    return reslottedCount;
}


function attachMultipliers(obj: Partial<ArtifactSet>, baseBonuses: BaseBonuses) {
    const { PECount, SECount, basePEBonus, baseSEBonus, baseRCBonus } = baseBonuses;

    const b: Bonuses = obj.bonuses!;

    obj.userEB = SECount
               * (baseSEBonus + b.SEBonus)
               * Math.pow(basePEBonus + b.PEBonus, PECount);

    obj.ebMultiplier = Math.pow(1 + b.PEBonus/basePEBonus, PECount)
                     * (1 + b.SEBonus/baseSEBonus);

    obj.researchCostBonus = b.CRBonus;

    obj.onlineMultiplier = b.EVBonus * (baseRCBonus + b.RCBonus);
    obj.offlineMultiplier = b.EVBonus * b.AEBonus;

    obj.totalOnlineMultiplier = obj.ebMultiplier * obj.onlineMultiplier;
    obj.totalOfflineMultiplier = obj.ebMultiplier * obj.offlineMultiplier;
}



import * as T from '@/scripts/types.ts';
import { round, arrayCompare } from '@/scripts/utils.ts';
import { getEffects, copyItem } from '@/scripts/artifacts.ts';
import { getStoneQueue } from '@/scripts/laying-set.ts';

type Bonuses = {
    prophecyEggBonus      : number,
    soulEggBonus          : number,
    eggValueBonus         : number, // laying rate bonus and boost effectiveness are treated as eggValueBonus
    maxRunningChickenBonus: number,
    awayEarningBonus      : number,
    researchCostBonus     : number,
};

export type AnnotatedArtifact = {
    artifact: T.Artifact,
    bonuses: Bonuses,
    stoneSlotAmount: number,
};

type AnnotatedStone = {
    stone: T.Stone,
    bonuses: Bonuses,
};

type SearchResult = {
    set?: ArtifactSet<AnnotatedArtifact>,
    stones?: AnnotatedStone[],
    bonuses?: Bonuses,
    score: number[],
};

export type ArtifactSet<T> = T[] & {
    bonuses?: Bonuses,
    userEB?: number,
    ebMultiplier?: number,
    onlineMultiplier?: number,
    offlineMultiplier?: number,
    totalOnlineMultiplier?: number,
    totalOfflineMultiplier?: number,
    researchCostBonus?: number,
};

const defaultBonus = {
    prophecyEggBonus      : 0,
    soulEggBonus          : 0,
    eggValueBonus         : 1,
    maxRunningChickenBonus: 0,
    awayEarningBonus      : 1,
    researchCostBonus     : 1,
};

function getArtifacts(items: T.Item[],
                      includeStones: boolean = true,
                      countMonocle: boolean = false): AnnotatedArtifact[] {
    const result: AnnotatedArtifact[] = [];

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
            artifact,
            bonuses: {
                prophecyEggBonus      : round(prophecyEggBonus),
                soulEggBonus          : round(soulEggBonus),
                eggValueBonus         : round(eggValueBonus*layingBonus*(countMonocle ? boostBonus : 1)),
                maxRunningChickenBonus: round(runningChickenBonus),
                awayEarningBonus      : round(awayEarningBonus),
                researchCostBonus     : round(researchCostBonus),
            },
            stoneSlotAmount       : artifact.stones?.length ?? 0,
        };

        result.push(annotatedArtifact);
    });

    return result;
}

function getStones(items: T.Item[], countMonocle: boolean = false): AnnotatedStone[] {
    const result: AnnotatedStone[] = [];

    items.forEach((item: T.Item) => {
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

        const annotatedStone: AnnotatedArtifact = {
            stone,
            bonuses: {
                prophecyEggBonus      : round(prophecyEggBonus),
                soulEggBonus          : round(soulEggBonus),
                eggValueBonus         : round(eggValueBonus*layingBonus*(countMonocle ? boostBonus : 1)),
                maxRunningChickenBonus: round(runningChickenBonus),
                awayEarningBonus      : round(awayEarningBonus),
                researchCostBonus     : round(researchCostBonus),
            },
        };

        result.push(annotatedStone);
    });

    return result;
}


export function computeOptimalSetsWithoutReslotting(items: T.Item[],
                                                    maxSlot: number,
                                                    baseBonuses: Record<string, number>,
                                                    countCube: boolean = true,
                                                    countMonocle: boolean = false,
                                                    online: boolean = true) {
    const { PECount, SECount, basePEBonus, baseSEBonus, baseRCBonus } = baseBonuses;

    const artifacts: AnnotatedArtifact[] = getArtifacts(items, true, countMonocle)
        .filter(x => x.bonuses.prophecyEggBonus > 0
                  || x.bonuses.soulEggBonus > 0
                  || x.bonuses.eggValueBonus > 1
                  || x.bonuses.maxRunningChickenBonus > 0
                  || x.bonuses.awayEarningBonus > 1
                  || x.bonuses.researchCostBonus < 1)
        .sort((a,b) => b.bonuses.prophecyEggBonus - a.bonuses.prophecyEggBonus
                    || b.bonuses.soulEggBonus - a.bonuses.soulEggBonus
                    || b.bonuses.eggValueBonus - a.bonuses.eggValueBonus
                    || a.bonuses.researchCostBonus - b.bonuses.researchCostBonus
                    || b.bonuses.maxRunningChickenBonus - a.bonuses.maxRunningChickenBonus
                    || b.bonuses.awayEarningBonus - a.bonuses.awayEarningBonus);


    let bestFound: SearchResult;


    // search EB set
    bestFound = search(artifacts, maxSlot, (b: Bonuses) => {
        const eb = (baseSEBonus + b.soulEggBonus)*SECount*Math.pow(basePEBonus + b.prophecyEggBonus, PECount);
        let bonus = b.eggValueBonus;
        bonus *= online ? baseRCBonus + b.maxRunningChickenBonus : b.awayEarningBonus;
        bonus /= countCube ? b.researchCostBonus : 1;
        return [round(eb), round(eb*bonus), 1/b.researchCostBonus];
    });
    const ebSet: ArtifactSet<T.Artifact | null> = Object.assign(
        bestFound.set?.map(x => x.artifact).sort((a,b) => a!.family - b!.family) ?? [],
        { bonuses: bestFound.bonuses ?? defaultBonus }
    );
    while (ebSet.length < maxSlot) ebSet.push(null);
    calculateMultipliers(ebSet, PECount, SECount, basePEBonus, baseSEBonus, baseRCBonus);


    // search Earning set
    bestFound = search(artifacts, maxSlot, (b: Bonuses) => {
        const eb = (baseSEBonus + b.soulEggBonus)*SECount*Math.pow(basePEBonus + b.prophecyEggBonus, PECount);
        let bonus = b.eggValueBonus;
        bonus *= online ? baseRCBonus + b.maxRunningChickenBonus : b.awayEarningBonus;
        bonus /= countCube ? b.researchCostBonus : 1;
        return [round(eb*bonus)];
    });
    const earningSet: ArtifactSet<T.Artifact | null> = Object.assign(
        bestFound.set?.map(x => x.artifact).sort((a,b) => a!.family - b!.family) ?? [],
        { bonuses: bestFound.bonuses ?? defaultBonus }
    );
    while (earningSet.length < maxSlot) earningSet.push(null);
    calculateMultipliers(earningSet, PECount, SECount, basePEBonus, baseSEBonus, baseRCBonus);


    // search Mirror set
    bestFound = search(artifacts, maxSlot, (b: Bonuses) => {
        const eb = (baseSEBonus + b.soulEggBonus)*SECount*Math.pow(basePEBonus + b.prophecyEggBonus, PECount);
        let bonus = b.eggValueBonus;
        bonus *= online ? baseRCBonus + b.maxRunningChickenBonus : b.awayEarningBonus;
        bonus /= countCube ? b.researchCostBonus : 1;
        return [round(bonus), round(eb*bonus), 1/b.researchCostBonus];
    });
    const mirrorSet: ArtifactSet<T.Artifact | null> = Object.assign(
        bestFound.set?.map(x => x.artifact).sort((a,b) => a!.family - b!.family) ?? [],
        { bonuses: bestFound.bonuses ?? defaultBonus }
    );
    while (mirrorSet.length < maxSlot) mirrorSet.push(null);
    calculateMultipliers(mirrorSet, PECount, SECount, basePEBonus, baseSEBonus, baseRCBonus);


    // search cube
    const cube = artifacts.sort((a, b) => a.bonuses.researchCostBonus - b.bonuses.researchCostBonus)[0] ?? null;


    return { ebSet, earningSet, mirrorSet, cube };
}

export function computeOptimalSetsWithReslotting(items: T.Item[],
                                                 maxSlot: number,
                                                 baseBonuses: Record<string, number>,
                                                 countCube: boolean = true,
                                                 countMonocle: boolean = false,
                                                 online: boolean = true) {
    const { PECount, SECount, basePEBonus, baseSEBonus, baseRCBonus } = baseBonuses;

    // Create priority queues for relevant stone families
    // and a list of marginal gains. …Marginals[i] is the marginal gain of the stone at index i
    const prophecyStoneQueue: T.Stone[] = getStoneQueue(items, T.StoneFamily.PROPHECY_STONE);
    const prophecyStoneMarginals: number[] = [];
    {
        let cumul = basePEBonus;
        for (const stone of prophecyStoneQueue) {
            const eff = getEffects(stone)['prophecy_egg_bonus'];
            prophecyStoneMarginals.push(Math.pow(1 + eff/cumul, PECount));
            cumul += eff;
        }
    }

    const soulStoneQueue: T.Stone[] = getStoneQueue(items, T.StoneFamily.SOUL_STONE);
    const soulStoneMarginals: number[] = [];
    {
        let cumul = baseSEBonus;
        for (const stone of soulStoneQueue) {
            const eff = getEffects(stone)['soul_egg_bonus'];
            soulStoneMarginals.push(1 + eff/cumul);
            cumul += eff;
        }
    }

    const terraStoneQueue: T.Stone[] = getStoneQueue(items, T.StoneFamily.TERRA_STONE);
    const terraStoneMarginals: number[] = [];
    {
        let cumul = baseRCBonus;
        for (const stone of terraStoneQueue) {
            const eff = getEffects(stone)['running_chicken_bonus'];
            terraStoneMarginals.push(1 + eff/cumul);
            cumul += eff;
        }
    }

    const tachyonStoneQueue: T.Stone[] = getStoneQueue(items, T.StoneFamily.TACHYON_STONE);
    const tachyonStoneMarginals: number[] = [];
    for (const stone of tachyonStoneQueue) {
        const eff = getEffects(stone)['laying_bonus'];
        tachyonStoneMarginals.push(eff);
    }

    const shellStoneQueue: T.Stone[] = getStoneQueue(items, T.StoneFamily.SHELL_STONE);
    const shellStoneMarginals: number[] = [];
    for (const stone of shellStoneQueue) {
        const eff = getEffects(stone)['egg_value_bonus'];
        shellStoneMarginals.push(eff);
    }

    const lunarStoneQueue: T.Stone[] = getStoneQueue(items, T.StoneFamily.LUNAR_STONE);
    const lunarStoneMarginals: number[] = [];
    for (const stone of lunarStoneQueue) {
        const eff = getEffects(stone)['away_earning_bonus'];
        lunarStoneMarginals.push(eff);
    }


    // Merge different families to single queues
    const { stoneQueue: ebStoneQueue, stoneMarginals: ebStoneMarginals } = mergeStoneQueues([
        { queue: prophecyStoneQueue, marginals: prophecyStoneMarginals },
        { queue: soulStoneQueue    , marginals: soulStoneMarginals     },
    ]);
    // If the queue has less than 12 stones, I could complete with shell/terra/lunar/tachyon stones
    // It's not worth doing it in my opinion, since it only concerns very early players

    const { stoneQueue: earningStoneQueue, stoneMarginals: earningStoneMarginals } = mergeStoneQueues([
        { queue: prophecyStoneQueue, marginals: prophecyStoneMarginals },
        { queue: soulStoneQueue    , marginals: soulStoneMarginals     },
        { queue: tachyonStoneQueue , marginals: tachyonStoneMarginals  },
        { queue: shellStoneQueue   , marginals: shellStoneMarginals    },
        (online ? { queue: terraStoneQueue   , marginals: terraStoneMarginals }
                : { queue: lunarStoneQueue   , marginals: lunarStoneMarginals })
    ]);

    const { stoneQueue: mirrorStoneQueue, stoneMarginals: mirrorStoneMarginals } = mergeStoneQueues([
        { queue: tachyonStoneQueue , marginals: tachyonStoneMarginals  },
        { queue: shellStoneQueue   , marginals: shellStoneMarginals    },
        (online ? { queue: terraStoneQueue   , marginals: terraStoneMarginals }
                : { queue: lunarStoneQueue   , marginals: lunarStoneMarginals })
    ]);


    // Calculate cumulative bonuses. If we use i stones from the queue, we get …Cumulatives[i] bonus
    const ebStoneCumulatives = ebStoneMarginals.slice().reduce((acc, current) => {
            acc.push(acc[acc.length-1]*current);
            return acc;
        }, [1]);
    const earningStoneCumulatives = earningStoneMarginals.slice().reduce((acc, current) => {
            acc.push(acc[acc.length-1]*current);
            return acc;
        }, [1]);
    const mirrorStoneCumulatives = mirrorStoneMarginals.slice().reduce((acc, current) => {
            acc.push(acc[acc.length-1]*current);
            return acc;
        }, [1]);



    // Relevant artifacts with interactions with stones: BoB, Vial
    // TODO: for pareto BoBs, for pareto Vial, compute proph/terra queues and search
    // Relevant artifacts without: Monocle, Metronome, Ankh, Necklace, Totem, Cube
    //
    // TODO: extract pareto artifacts?
    // TODO: find best artifacts (taking into account stoneSlotCount giving cumulative bonuses)

    const ebSet: ArtifactSet<T.Artifact | null> = [null, null, null, null];
    const earningSet: ArtifactSet<T.Artifact | null> = [null, null, null, null];
    const mirrorSet: ArtifactSet<T.Artifact | null> = [null, null, null, null];
    const cube: AnnotatedArtifact | null = null;
    throw new Error("Not implemented");
    return { ebSet, earningSet, mirrorSet, cube };
}


function computeEBSetWithReslotting(items: T.Item[],
                                    maxSlot: number,
                                    baseBonuses: Record<string, number>,
                                    countCube: boolean = true,
                                    countMonocle: boolean = false,
                                    online: boolean = true) {
    const { PECount, SECount, basePEBonus, baseSEBonus, baseRCBonus } = baseBonuses;

    /*
    const stoneHolders: T.AnnotatedArtifact[][] = ...
    for (const book of books) {
        const stoneQueue = ...
        const stoneCumulatives = ...
    }
    */

    const prophecyStoneQueue: T.Stone[] = getStoneQueue(items, T.StoneFamily.PROPHECY_STONE);
    const prophecyStoneMarginals: number[] = [];
    {
        let cumul = basePEBonus;
        for (const stone of prophecyStoneQueue) {
            const eff = getEffects(stone)['prophecy_egg_bonus'];
            prophecyStoneMarginals.push(Math.pow(1 + eff/cumul, PECount));
            cumul += eff;
        }
    }

    const soulStoneQueue: T.Stone[] = getStoneQueue(items, T.StoneFamily.SOUL_STONE);
    const soulStoneMarginals: number[] = [];
    {
        let cumul = baseSEBonus;
        for (const stone of soulStoneQueue) {
            const eff = getEffects(stone)['soul_egg_bonus'];
            soulStoneMarginals.push(1 + eff/cumul);
            cumul += eff;
        }
    }

    // Merge different families to single queues
    const { stoneQueue: ebStoneQueue, stoneMarginals: ebStoneMarginals } = mergeStoneQueues([
        { queue: prophecyStoneQueue, marginals: prophecyStoneMarginals },
        { queue: soulStoneQueue    , marginals: soulStoneMarginals     },
    ]);
    // If the queue has less than 12 stones, I could complete with shell/terra/lunar/tachyon stones
    // It's not worth doing it in my opinion, since it only concerns very early players


    // Calculate cumulative bonuses. If we use i stones from the queue, we get …Cumulatives[i] bonus
    const ebStoneCumulatives = ebStoneMarginals.slice().reduce((acc, current) => {
            acc.push(acc[acc.length-1]*current);
            return acc;
        }, [1]);

    // Relevant artifacts with interactions with stones: BoB, Vial
    // TODO: for pareto BoBs, for pareto Vial, compute proph/terra queues and search
    // Relevant artifacts without: Monocle, Metronome, Ankh, Necklace, Totem, Cube
    //
    // TODO: extract pareto artifacts?
    // TODO: find best artifacts (taking into account stoneSlotCount giving cumulative bonuses)

    const ebSet: ArtifactSet<T.Artifact | null> = [null, null, null, null];
}



/*
 * Helper for testing if a family is already present in a set
 */
function hasFamily(set: AnnotatedArtifact[], family: T.ArtifactFamily): boolean {
    return set.some(x => x.artifact.family === family);
}


/*
 * Recursively search for the best set, for a given evaluation function
 */
function search(artifacts: AnnotatedArtifact[],
                maxSlot: number,
                evalFn: (arg0: Bonuses) => number[],
                startIdx: number = 0,
                currentSet: AnnotatedArtifact[] = [],
                currentBonuses: Bonuses = defaultBonus,
                bestFound: SearchResult = { score: [-Infinity] }
                ): SearchResult {
    const score = evalFn(currentBonuses);
    if (arrayCompare(bestFound.score, score) < 0) {
        bestFound.score = score;
        bestFound.set = [...currentSet];
        bestFound.stones = [];
        bestFound.bonuses = {...currentBonuses};
    }
    if (currentSet.length >= maxSlot) {
        return bestFound;
    }
    const extraStoneSlot = (maxSlot - currentSet.length)*3;
    const bonusUpperBound = {
        prophecyEggBonus      : currentBonuses.prophecyEggBonus +
                                (hasFamily(currentSet, T.ArtifactFamily.BOOK_OF_BASAN) ? 0 : 0.012) +
                                extraStoneSlot*0.0015,
        soulEggBonus          : currentBonuses.soulEggBonus +
                                extraStoneSlot*0.25,
        eggValueBonus         : currentBonuses.eggValueBonus *
                                (hasFamily(currentSet, T.ArtifactFamily.DEMETERS_NECKLACE) ? 1 : 3) *
                                (hasFamily(currentSet, T.ArtifactFamily.TUNGSTEN_ANKH) ? 1 : 2.5) *
                                (hasFamily(currentSet, T.ArtifactFamily.QUANTUM_METRONOME) ? 1 : 1.35) *
                                (hasFamily(currentSet, T.ArtifactFamily.DILITHIUM_MONOCLE) ? 1 : 1.3) *
                                extraStoneSlot*1.1,
        maxRunningChickenBonus: currentBonuses.maxRunningChickenBonus +
                                (hasFamily(currentSet, T.ArtifactFamily.VIAL_OF_MARTIAN_DUST) ? 0 : 500) +
                                extraStoneSlot*100,
        awayEarningBonus      : currentBonuses.awayEarningBonus *
                                (hasFamily(currentSet, T.ArtifactFamily.LUNAR_TOTEM) ? 1 : 200) *
                                extraStoneSlot*1.4,
        researchCostBonus     : currentBonuses.researchCostBonus *
                                (hasFamily(currentSet, T.ArtifactFamily.PUZZLE_CUBE) ? 1 : 0.4),
    };
    const scoreUpperBound = evalFn(bonusUpperBound);
    if (arrayCompare(scoreUpperBound, bestFound.score) < 0) {
        return bestFound;
    }

    for (let i = startIdx; i < artifacts.length; i++) {
        const artifact = artifacts[i];
        if (currentSet.some(x => x.artifact.family === artifact.artifact.family)) continue;
        currentSet.push(artifact);
        const newBonuses = {
            prophecyEggBonus      : currentBonuses.prophecyEggBonus + artifact.bonuses.prophecyEggBonus,
            soulEggBonus          : currentBonuses.soulEggBonus + artifact.bonuses.soulEggBonus,
            eggValueBonus         : currentBonuses.eggValueBonus * artifact.bonuses.eggValueBonus,
            maxRunningChickenBonus: currentBonuses.maxRunningChickenBonus + artifact.bonuses.maxRunningChickenBonus,
            awayEarningBonus      : currentBonuses.awayEarningBonus * artifact.bonuses.awayEarningBonus,
            researchCostBonus     : currentBonuses.researchCostBonus * artifact.bonuses.researchCostBonus,
        };
        search(artifacts, maxSlot, evalFn, i+1, currentSet, newBonuses, bestFound);
        currentSet.pop();
    }
    return bestFound;
}

function calculateMultipliers(set: ArtifactSet<T.Artifact | null>,
                              PE: number, SE: number,
                              basePEBonus: number, baseSEBonus: number, baseRCBonus: number) {
    set.userEB  = SE;
    set.userEB *= Math.pow(basePEBonus + set.bonuses!.prophecyEggBonus, PE);
    set.userEB *= (baseSEBonus + set.bonuses!.soulEggBonus);

    set.ebMultiplier  = Math.pow(1 + set.bonuses!.prophecyEggBonus/basePEBonus, PE);
    set.ebMultiplier *= (1 + set.bonuses!.soulEggBonus/baseSEBonus);

    set.onlineMultiplier  = set.bonuses!.eggValueBonus;
    set.onlineMultiplier *= (set.bonuses!.maxRunningChickenBonus + baseRCBonus);

    set.offlineMultiplier  = set.bonuses!.eggValueBonus;
    set.offlineMultiplier *= set.bonuses!.awayEarningBonus;

    set.totalOnlineMultiplier = set.ebMultiplier * set.onlineMultiplier;
    set.totalOfflineMultiplier = set.ebMultiplier * set.offlineMultiplier;

    set.researchCostBonus = set.bonuses!.researchCostBonus;
}


function mergeStoneQueues(inputs: {queue: T.Stone[], marginals: number[]}[], queueSize: number = 12) {
    const stoneQueue: T.Stone[] = [];
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

    return { stoneQueue, stoneMarginals };
}

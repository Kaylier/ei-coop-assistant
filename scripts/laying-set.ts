import { round, extractParetoFrontier, extractParetoFrontier3, combinations, product } from '/scripts/utils.ts';
import * as T from '/scripts/types.ts';
import { getEffects, copyItem } from '/scripts/artifacts.ts';



type ArtifactGroup = T.Artifact[] & {
    deflectorBonus  : number,
    layingBonus     : number,
    shippingBonus   : number,
    habCapacityBonus: number,
    maxLayingBonus  : number | undefined,
    stoneSlotAmount : number | undefined,
};

type ArtifactSet<T> = T[] & {
    deflectorBonus    : number,
    layingBonus       : number,
    shippingBonus     : number,
    habCapacityBonus  : number,
    maxLayingBonus    : number | undefined,
    stoneSlotAmount   : number | undefined,
    tachyonStoneAmount: number | undefined,
    quantumStoneAmount: number | undefined,
};



export function computeOptimalSetsWithoutReslotting(items: T.Item[],
                                                    deflectorMode: T.DeflectorMode,
                                                    maxSlot: number
                                                   ): ArtifactSet<T.Artifact>[][] {
    const artifactsByFamily: Map<T.ArtifactFamily, T.Artifact[]> = getArtifacts(items, true);

    // Remove forbidden deflectors
    if (deflectorMode === T.DeflectorMode.TEAMWORK) {
        removeSubDeflectors(artifactsByFamily);
    }


    // For each family, only keep non-dominated artifacts
    const artifactGroups: Map<T.ArtifactFamily, ArtifactGroup[]> = new Map();
    for (let [family, artifacts] of artifactsByFamily) {
        if (!artifacts?.length) continue;

        if (family === T.ArtifactFamily.TACHYON_DEFLECTOR) {
            artifacts = extractParetoFrontier3(artifacts.map(x => [
                (x.layingBonus ?? 1)*(x.habCapacityBonus ?? 1),
                x.shippingBonus ?? 1,
                x.deflectorBonus ?? 0,
                x]));
        } else {
            artifacts = extractParetoFrontier(artifacts.map(x => [
                (x.layingBonus ?? 1)*(x.habCapacityBonus ?? 1),
                x.shippingBonus ?? 1,
                x]));
        }

        // move effect properties to the group for easier access
        artifacts.forEach(group => Object.assign(group, {
            deflectorBonus  : group[0].deflectorBonus,
            layingBonus     : group[0].layingBonus,
            shippingBonus   : group[0].shippingBonus,
            habCapacityBonus: group[0].habCapacityBonus,
        }));
        artifacts = artifacts.filter(x => x.deflectorBonus !== 0
                                       || x.layingBonus !== 1
                                       || x.shippingBonus !== 1
                                       || x.habCapacityBonus !== 1);

        artifactGroups.set(family, artifacts);
    }


    // Build family sets progressively
    let familySets: T.ArtifactFamily[][] = [[]];
    let families = Object.values(T.ArtifactFamily).reverse().filter(family => (artifactGroups.get(family) ?? []).length > 0);
    // If deflector is forced, add it first
    if (deflectorMode !== T.DeflectorMode.NONE) {
        familySets = familySets.map(familySet => [...familySet, T.ArtifactFamily.TACHYON_DEFLECTOR]);
        families = families.filter(family => family !== T.ArtifactFamily.TACHYON_DEFLECTOR);
    }
    familySets = familySets.flatMap(familySet => {
        const combs = [...combinations(families, maxSlot - familySet.length, true)];
        return combs.map(x => [...familySet, ...x]);
    });


    // Build candidate artifact sets (stone holders not included, but stone count fixed)
    const sets: ArtifactSet<ArtifactGroup>[] = [];
    for (const familySet of familySets) {
        for (const set of product(...familySet.map(family => artifactGroups.get(family) ?? []))) {
            const deflectorBonus   = set.reduce((tot, cur) => tot + cur.deflectorBonus  , 0);
            const layingBonus      = set.reduce((tot, cur) => tot * cur.layingBonus     , 1);
            const shippingBonus    = set.reduce((tot, cur) => tot * cur.shippingBonus   , 1);
            const habCapacityBonus = set.reduce((tot, cur) => tot * cur.habCapacityBonus, 1);

            const annotatedSet: ArtifactSet<ArtifactGroup> = Object.assign(set, {
                deflectorBonus    : round(deflectorBonus),
                layingBonus       : round(layingBonus),
                shippingBonus     : round(shippingBonus),
                habCapacityBonus  : round(habCapacityBonus),
            });

            sets.push(annotatedSet);
        }
    }
    sets.forEach(set => set.maxLayingBonus = (set.layingBonus ?? 1)*(set.habCapacityBonus ?? 1));

    // Extract non-dominated sets
    console.log(familySets.length, "family sets expanded to", sets.length, "candidate sets");
    const paretoSets: ArtifactSet<ArtifactGroup>[][] = extractParetoFrontier(sets.map(x => [
        x.maxLayingBonus ?? 1,
        x.shippingBonus ?? 1,
        x
    ]));


    // At this point, paretoSets is an array of groups,
    // each group is an array of equivalent sets regarding maxLayingBonus and shippingBonus,
    // each set is an array of artifact groups (equivalent artifacts)
    // We expand artifact groups so we now have sets with actual artifacts
    let optimalSets: ArtifactSet<T.Artifact>[][] = paretoSets.map(group => group.flatMap(set =>
        [...product(...set)].map(x => Object.assign(x.map(copyItem), {
            deflectorBonus    : set.deflectorBonus,
            layingBonus       : set.layingBonus,
            shippingBonus     : set.shippingBonus,
            habCapacityBonus  : set.habCapacityBonus,
            maxLayingBonus    : set.maxLayingBonus,
        }))));

    // Only keep highest deflectors
    optimalSets = optimalSets.map(group => {
        const bestBonus = Math.max(...group.map(x => x.deflectorBonus));
        return group.filter(x => x.deflectorBonus === bestBonus);
    });

    // some properties are common to the whole group, we can move the properties up for easier access
    optimalSets.forEach(group => Object.assign(group, {
        deflectorBonus: group[0].deflectorBonus,
        maxLayingBonus: group[0].maxLayingBonus,
        shippingBonus : group[0].shippingBonus,
    }));

    console.log("Amount of equivalent set for each solution:", optimalSets.map(x => x.length));

    return optimalSets;
}



export function computeOptimalSetsWithReslotting(items: T.Item[],
                                                 deflectorMode: T.DeflectorMode,
                                                 maxSlot: number
                                                ): ArtifactSet<T.Artifact>[][] {
    // Find tachyon and quantum stones, and create queues of priority (highest to lowest tiers)
    const tachyonQueue: T.Stone[] = getStoneQueue(items, T.StoneFamily.TACHYON_STONE);
    const quantumQueue: T.Stone[] = getStoneQueue(items, T.StoneFamily.QUANTUM_STONE);

    // Precompute cumulative bonuses, tachyonBonus[i] is the bonus for i tachyon stones inserted
    let cumul;
    const tachyonBonus: number[] = [1];
    cumul = 1;
    for (const stone of tachyonQueue) {
        const { laying_bonus: layingBonus = 1 } = getEffects(stone);
        cumul *= layingBonus;
        tachyonBonus.push(round(cumul));
    }
    const quantumBonus: number[] = [1];
    cumul = 1;
    for (const stone of quantumQueue) {
        const { shipping_bonus: shippingBonus = 1 } = getEffects(stone);
        cumul *= shippingBonus;
        quantumBonus.push(round(cumul));
    }


    const artifactsByFamily: Map<T.ArtifactFamily, T.Artifact[]> = getArtifacts(items, false);

    // Remove forbidden deflectors
    if (deflectorMode === T.DeflectorMode.TEAMWORK) {
        removeSubDeflectors(artifactsByFamily);
    }


    // For each family, only keep non-dominated artifacts
    const artifactGroups: Map<T.ArtifactFamily, ArtifactGroup[]> = new Map();
    for (let [family, artifacts] of artifactsByFamily) {
        if (!artifacts?.length) continue;

        // Since only a single effect exist in each family, we can shortcut by using a compounded formula
        // For metronome, it will be equivalent to layingBonus for example
        // For non contract families, it is just 1 and we end up with artifacts with the maximum amount of slot
        artifacts = extractParetoFrontier(artifacts.map(x => [
            (1 + (x.deflectorBonus ?? 0))*(x.layingBonus ?? 1)*(x.shippingBonus ?? 1)*(x.habCapacityBonus ?? 1),
            x.stoneSlotAmount,
            x]));

        // move effect properties to the group for easier access
        artifacts.forEach(group => Object.assign(group, {
            deflectorBonus  : group[0].deflectorBonus,
            layingBonus     : group[0].layingBonus,
            shippingBonus   : group[0].shippingBonus,
            habCapacityBonus: group[0].habCapacityBonus,
            stoneSlotAmount : group[0].stoneSlotAmount,
        }));
        artifacts = artifacts.filter(x => x.deflectorBonus !== 0
                                       || x.layingBonus !== 1
                                       || x.shippingBonus !== 1
                                       || x.habCapacityBonus !== 1
                                       || x.stoneSlotAmount !== 0);

        artifactGroups.set(family, artifacts);
    }



    // In non-contract families, we organize stone holders by amount of stone first, family second
    // highest stone slot count artifacts are grouped and put in stoneHolders[stoneCount]
    const stoneHolders: T.ArtifactFamily[][] = [[], [], [], []];
    const stoneHolderFamilies: T.ArtifactFamily[] = Object.values(T.ArtifactFamily)
        .filter(family => (artifactGroups.get(family)?.length ?? 0) > 0
                       && family !== T.ArtifactFamily.TACHYON_DEFLECTOR
                       && family !== T.ArtifactFamily.QUANTUM_METRONOME
                       && family !== T.ArtifactFamily.INTERSTELLAR_COMPASS
                       && family !== T.ArtifactFamily.GUSSET
                       && family !== T.ArtifactFamily.LIGHT_OF_EGGENDIL)
        .map(family => {
            // Check that we have a single group
            const artifacts = artifactGroups.get(family) ?? [];
            if (artifacts.length !== 1) {
                console.error(family, artifacts);
                throw new Error("Found multiple non-dominated artifacts in a non-contract family.");
            }
            return family;
        })
        .sort((a, b) => {
            // We put prefered families first
            const arta = artifactGroups.get(a)[0];
            const artb = artifactGroups.get(b)[0];
            return artb.stoneSlotAmount - arta.stoneSlotAmount
                || countSlotted(artb) - countSlotted(arta)
                || artb.reduce((t,c) => t+(c.quantity), 0) - arta.reduce((t,c) => t+(c.quantity), 0) ;
        });
    for (const [idx, family] of stoneHolderFamilies.entries()) {
        const artifacts = artifactGroups.get(family)[0];
        // We keep families as long as they have at least one slotted artifact
        // Minimum 4 families
        if (countSlotted(artifacts) === 0 && 4 <= idx) {
            break;
        }
        const stoneSlotAmount = artifacts.stoneSlotAmount;
        if (!(stoneSlotAmount > 0)) continue;
        if (stoneSlotAmount > 3) {
            throw new Error("Found artifacts with more than 3 stone slots.");
        }
        stoneHolders[stoneSlotAmount].push(family);
    }



    // Build family sets progressively
    let familySets: T.ArtifactFamily[][] = [[]];
    let families = [
        T.ArtifactFamily.TACHYON_DEFLECTOR,
        T.ArtifactFamily.QUANTUM_METRONOME,
        T.ArtifactFamily.INTERSTELLAR_COMPASS,
        T.ArtifactFamily.GUSSET,
    ];
    // If deflector is forced, add it first
    if (deflectorMode !== T.DeflectorMode.NONE) {
        familySets = familySets.map(familySet => [...familySet, T.ArtifactFamily.TACHYON_DEFLECTOR]);
        families = families.filter(family => family !== T.ArtifactFamily.TACHYON_DEFLECTOR);

    }
    // Add combinations of contract families
    familySets = familySets.flatMap(familySet => {
        const combs = [...combinations(families, maxSlot - familySet.length, true)];
        return combs.map(x => [...familySet, ...x]);
    });
    // Add stone holder fillers
    for (let i = 3; i > 0; i--) {
        familySets = familySets.flatMap(familySet => {
            if (familySet.length + stoneHolders[i].length < maxSlot) {
                return [[...familySet, ...stoneHolders[i]]];
            } else {
                const combs = [...combinations(stoneHolders[i], maxSlot - familySet.length)];
                return combs.map(x => [...familySet, ...x]);
            }
        });
    }



    // Build candidate artifact sets (stone holders not included, but stone count fixed)
    let sets: ArtifactSet<ArtifactGroup>[] = [];
    for (const familySet of familySets) {
        for (const set of product(...familySet.map(family => artifactGroups.get(family) ?? []))) {
            const deflectorBonus   = set.reduce((tot, cur) => tot + cur.deflectorBonus  , 0);
            const layingBonus      = set.reduce((tot, cur) => tot * cur.layingBonus     , 1);
            const shippingBonus    = set.reduce((tot, cur) => tot * cur.shippingBonus   , 1);
            const habCapacityBonus = set.reduce((tot, cur) => tot * cur.habCapacityBonus, 1);
            const stoneSlotAmount  = set.reduce((tot, cur) => tot + cur.stoneSlotAmount , 0);

            for (let tachyonAmount = 0; tachyonAmount <= Math.min(stoneSlotAmount, tachyonQueue.length); tachyonAmount++) {
                const quantumAmount = Math.min(stoneSlotAmount - tachyonAmount, quantumQueue.length);

                const stonedSet = Object.assign([...set], {
                    deflectorBonus    : round(deflectorBonus),
                    layingBonus       : round(layingBonus*tachyonBonus[tachyonAmount]),
                    shippingBonus     : round(shippingBonus*quantumBonus[quantumAmount]),
                    habCapacityBonus  : round(habCapacityBonus),
                    stoneSlotAmount   : stoneSlotAmount,
                    tachyonStoneAmount: tachyonAmount,
                    quantumStoneAmount: quantumAmount,
                });

                sets.push(stonedSet);
            }
        }
    }
    sets.forEach(set => set.maxLayingBonus = (set.layingBonus ?? 1)*(set.habCapacityBonus ?? 1));

    // Extract non-dominated sets
    console.log(familySets.length, "family sets expanded to", sets.length, "candidate sets");
    const paretoSets: ArtifactSet<ArtifactGroup>[][] = extractParetoFrontier(sets.map(x => [
        x.maxLayingBonus ?? 1,
        x.shippingBonus ?? 1,
        x
    ]));


    // At this point, paretoSets is an array of groups,
    // each group is an array of equivalent sets regarding maxLayingBonus and shippingBonus,
    // each set is an array of artifact groups (equivalent artifacts)
    // We expand artifact groups so we now have sets with actual artifacts
    let optimalSets: ArtifactSet<T.Artifact>[][] = paretoSets.map(group => group.flatMap(set => [...product(...set)].map(x => Object.assign(x.map(x => copyItem(x)), {
        deflectorBonus    : set.deflectorBonus,
        layingBonus       : set.layingBonus,
        shippingBonus     : set.shippingBonus,
        habCapacityBonus  : set.habCapacityBonus,
        stoneSlotAmount   : set.stoneSlotAmount,
        tachyonStoneAmount: set.tachyonStoneAmount,
        quantumStoneAmount: set.quantumStoneAmount,
        maxLayingBonus    : set.maxLayingBonus,
    }))));

    // Only keep highest deflectors
    optimalSets = optimalSets.map(group => {
        const bestBonus = Math.max(...group.map(x => x.deflectorBonus));
        return group.filter(x => x.deflectorBonus === bestBonus);
    });

    // maxLayingBonus and shippingBonus are common to the whole group, we can move the properties up
    optimalSets.forEach(group => Object.assign(group, {
        deflectorBonus: group[0].deflectorBonus,
        maxLayingBonus: group[0].maxLayingBonus,
        shippingBonus : group[0].shippingBonus,
    }));

    // Assign stones to optimalSets, and sort them by amount of reslotting
    console.log(optimalSets.reduce((tot, cur) => tot+cur.length, 0), "reslotting options");
    for (const group of optimalSets) {
        for (const set of group) {
            const stones = [
                ...tachyonQueue.slice(0, set.tachyonStoneAmount ?? 0),
                ...quantumQueue.slice(0, set.quantumStoneAmount ?? 0),
            ];
            assignStones(set, stones);
        }
        group.sort((a,b) => (a.reslotted ?? Infinity) - (b.reslotted ?? Infinity));
    }

    console.log("Amount of equivalent set for each solution:", optimalSets.map(x => x.length));

    return optimalSets;
}



/*
 * Group artifacts by families, and annotate them with bonus properties (layingBonus, shippingBonus...)
 */
function getArtifacts(items: T.Item[], includeStones: boolean = true): Map<T.ArtifactFamily, T.Artifact[]> {
    const result = new Map<T.ArtifactFamily, T.Artifact[]>();

    items.forEach((item: T.Item) => {
        if (item.category !== T.ItemCategory.ARTIFACT) return;
        const artifact = copyItem(item) as T.Artifact;

        const {
            hab_capacity_bonus: habCapacityBonus = 1,
            laying_bonus      : layingBonus      = 1,
            shipping_bonus    : shippingBonus    = 1,
            team_laying_bonus : deflectorBonus   = 0
        } = getEffects(artifact, includeStones);

        artifact.layingBonus = round(layingBonus);
        artifact.habCapacityBonus = round(habCapacityBonus);
        artifact.shippingBonus = round(shippingBonus);
        artifact.deflectorBonus = round(deflectorBonus);
        artifact.stoneSlotAmount = artifact.stones?.length ?? 0;

        if (!result.has(artifact.family)) {
            result.set(artifact.family, []);
        }
        result.get(artifact.family).push(artifact);
    });

    return result;
}



/*
 * Remove all deflectors but the ones with the highest bonus
 */
function removeSubDeflectors(artifactsByFamily: Map<T.ArtifactFamily, T.Artifact[]>) {
    const deflectors = artifactsByFamily.get(T.ArtifactFamily.TACHYON_DEFLECTOR);
    if (!deflectors?.length) return;

    const bestBonus = Math.max(...deflectors.map(x => x.deflectorBonus));
    const bestDeflectors = deflectors.filter(x => x.deflectorBonus === bestBonus);

    artifactsByFamily.set(T.ArtifactFamily.TACHYON_DEFLECTOR, bestDeflectors);
}



/*
 * Count the amount of artifacts with tachyon or quantum stones currently slotted.
 * This is used to prioritize stone holding families
 */
function countSlotted(artifacts: T.Artifact[]): number {
    if (!artifacts?.length) return 0;
    let count = 0;
    for (const artifact of artifacts) {
        if (artifact.stones?.some(stone => stone && stone.family === T.StoneFamily.TACHYON_STONE)) {
            count += artifact.quantity ?? 1;
        }
        if (artifact.stones?.some(stone => stone && stone.family === T.StoneFamily.QUANTUM_STONE)) {
            count += artifact.quantity ?? 1;
        }
    }
    return count;
}



/*
 * Returns a priority queue for stone slotting in a given family.
 * Builds a list of stones sorted by tier in descending order (e.g., T4 first, then T3, etc.).
 * Only includes stones with tier >= 2 (ignoring fragments).
 */
function getStoneQueue(items: T.Item[], family: T.StoneFamily, queueSize: number = 12): T.Stone[] {
    // Store stone amount for [invalid, T1 (fragment), T2, T3, T4]
    const stoneCount: number[] = [0, 0, 0, 0, 0];

    /*
     * If item is a stone of the desired family, increment stoneCount
     */
    function addStone(item: T.Item) {
        if (item.category !== T.ItemCategory.STONE || item.family !== family) return;
        const tier = item.tier ?? 0;
        if (tier < 0 || stoneCount.length <= tier) return;
        stoneCount[tier] += item.quantity ?? 1;
    }

    items.forEach((item: T.Item) => {
        addStone(item);
        item.stones?.forEach(stone => stone && addStone(stone));
    });

    // Ignore invalid tiers (0) and fragments (1)
    stoneCount[0] = 0;
    stoneCount[1] = 0;

    // Build the queue with highest tiers first
    const queue: T.Stone[] = [];
    let currentTier: number = stoneCount.length - 1;
    let remainingCount: number = queueSize;
    while (remainingCount > 0 && currentTier > 1) {
        if (stoneCount[currentTier] > 0) {
            queue.push({
                category: T.ItemCategory.STONE,
                family: family,
                tier: currentTier,
            } as T.Stone);
            stoneCount[currentTier] -= 1;
            remainingCount -= 1;
        } else {
            currentTier -= 1;
        }
    }

    return queue;
}



/*
 * Assign stones in artifacts of a set.
 * If some of the desired stones are already slotted, keep them where they are
 * The missing stones will replace unwanted ones.
 */
function assignStones(set: T.Artifact[], stones: T.Stone[]): T.Artifact[] {
    const stoneKey = s => s ? `${s.category}-${s.family}-${s.tier}` : null;

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

    set.reslotted = slotsToFill.length;

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

    return set;
}


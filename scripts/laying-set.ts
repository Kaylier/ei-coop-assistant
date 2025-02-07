import { round, minmaxReduce, combinations, product } from '/scripts/utils.ts';
import * as T from '/scripts/types.ts';
import { getEffects, copyItem } from '/scripts/artifacts.ts';

/*
 * Preprocess and group artifacts by families.
 * Enhances each artifact with computed bonus properties.
 */
function getPreprocessedArtifacts(items: T.Item[], includeStones: boolean = true): Map<T.ArtifactFamily, T.Artifact[]> {
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

        artifact.layingBonusEq = round(layingBonus*habCapacityBonus);
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
 * Generates all artifact sets using artifacts belonging to the given families.
 */
function* getArtifactSets(artifacts: Map<T.ArtifactFamily, T.Artifact[]>,
                          families: T.ArtifactFamily[],
                          maxSlot: number,
                          includeDeflector: boolean = false
                         ): Generator<T.Artifact[], void, unknown> {
    // Preemptively filter out empty families
    families = families.filter(family => (artifacts.get(family)?.length ?? 0) > 0).sort();

    for (let size = 0; size <= maxSlot; size++) {
        for (const familySet of combinations(families, size)) {
            if (includeDeflector && !familySet.includes(T.ArtifactFamily.TACHYON_DEFLECTOR)) {
                continue;
            }
            for (const set of product(...familySet.map(family => artifacts.get(family)))) {
                yield set;
            }
        }
    }
}


/*
 * Find the minimum deflector bonus allowed according to current settings
 */
function getMinDeflectorBonus(artifacts: Map<T.ArtifactFamily, T.Artifact[]>,
                              includeDeflector: boolean,
                              deflectorMode: 'contribution' | 'teamwork'
                             ): number {
    // If no deflector is forced, no minimum
    // For contribution mode, only the presence of a deflector is forced, without minimum
    if (!includeDeflector || deflectorMode !== "teamwork") {
        return 0;
    }
    // For teamwork mode, take the highest deflector available
    const deflectors = artifacts.get(T.ArtifactFamily.TACHYON_DEFLECTOR) || [];
    if (deflectors.length === 0) {
        return 0;
    }
    return Math.max(...deflectors.map(artifact => artifact.deflectorBonus ?? 0));
}


export function computeOptimalSetsWithoutReslotting(items: T.Item[],
                                                    includeDeflector: boolean,
                                                    deflectorMode: 'contribution' | 'teamwork',
                                                    maxSlot: number
                                                   ): T.Artifact[][] {
    const artifacts: Map<T.ArtifactFamily, T.Artifact[]> = getPreprocessedArtifacts(items);
    const minDeflectorBonus: number = getMinDeflectorBonus(artifacts, includeDeflector, deflectorMode);

    // Filter out artifacts without relevant bonuses, and sort the remaining ones in prefered order
    for (const family of artifacts.keys()) {
        const filteredArtifacts = artifacts.get(family)
            .filter(item => item.layingBonusEq !== 1
                         || item.shippingBonus !== 1
                         || item.family === T.ArtifactFamily.TACHYON_DEFLECTOR)
            .sort((a, b) => b.deflectorBonus - a.deflectorBonus
                         || b.tier - a.tier
                         || b.rarity - a.rarity);
        artifacts.set(family, filteredArtifacts);
    }

    // Remove suboptimal artifacts (outperformed by an other on both laying and shipping bonuses)
    for (const family of artifacts.keys()) {
        if (includeDeflector && family === T.ArtifactFamily.TACHYON_DEFLECTOR) {
            // Prevents removing deflectors, they may be suboptimal in regard to laying/shipping,
            // but still have a better bonus
            continue;
        }
        artifacts.set(family, minmaxReduce(artifacts.get(family), 'layingBonusEq', 'shippingBonus', true));
    }

    // Get all candidate artifact sets
    let sets: T.Artifact[][] = [];
    for (const set of getArtifactSets(artifacts, Array.from(artifacts.keys()), maxSlot, includeDeflector)) {
        const [layingBonusEq, shippingBonus, deflectorBonus] = set.reduce(
            ([layingTot, shippingTot, deflectorTot], item) => [
                layingTot*item.layingBonusEq,
                shippingTot*item.shippingBonus,
                deflectorTot+item.deflectorBonus
            ], [1, 1, 0]);
        set.layingBonusEq = round(layingBonusEq);
        set.shippingBonus = round(shippingBonus);
        set.deflectorBonus = round(deflectorBonus);

        if (minDeflectorBonus <= set.deflectorBonus) {
            sets.push(set);
        }
    }
    console.log(sets.length, "candidate sets found");

    // Get optimal sets
    sets.sort((a, b) => b.deflectorBonus - a.deflectorBonus);
    sets = minmaxReduce(sets, 'layingBonusEq', 'shippingBonus', true);

    return sets;
}


export function computeOptimalSetsWithReslotting(items: T.Item[],
                                                 includeDeflector: boolean,
                                                 deflectorMode: 'contribution' | 'teamwork',
                                                 maxSlot: number
                                                ): T.Artifact[][] {
    const artifacts: Map<T.ArtifactFamily, T.Artifact[]> = getPreprocessedArtifacts(items, false);
    const minDeflectorBonus: number = getMinDeflectorBonus(artifacts, includeDeflector, deflectorMode);

    const contractFamiliesConfig = [
        { family: T.ArtifactFamily.QUANTUM_METRONOME   , bonusProp: 'layingBonusEq' },
        { family: T.ArtifactFamily.INTERSTELLAR_COMPASS, bonusProp: 'shippingBonus' },
        { family: T.ArtifactFamily.GUSSET              , bonusProp: 'layingBonusEq' },
    ];
    if (includeDeflector) {
        contractFamiliesConfig.push({ family: T.ArtifactFamily.TACHYON_DEFLECTOR, bonusProp: 'deflectorBonus' });
    }
    const contractFamilies = contractFamiliesConfig.map(({ family }) => family);

    // Filter out irrelevant artifacts in the contract families
    contractFamiliesConfig.forEach(({ family, bonusProp }) => {
        const prunedArtifacts = minmaxReduce(artifacts.get(family) ?? [], bonusProp, 'stoneSlotAmount', true);
        artifacts.set(family, prunedArtifacts);
    });

    // Find the best stone holders from each non-contract families
    const stoneHolders: T.Artifact[] = [];
    for (const [family, familyArtifacts] of artifacts.entries()) {
        if (contractFamilies.includes(family)) {
            continue
        }
        if (!familyArtifacts || familyArtifacts.length === 0) {
            continue
        }

        const bestArtifact = familyArtifacts.reduce(
            (best, cur) => cur.stoneSlotAmount > best.stoneSlotAmount ? cur : best,
            familyArtifacts[0]);

        if (bestArtifact.stoneSlotAmount > 0) {
            stoneHolders.push(bestArtifact);
        }
    }
    // Only keep the 4 best, we don't need more
    stoneHolders.sort((a,b) => b.stoneSlotAmount - a.stoneSlotAmount).splice(4, stoneHolders.length);

    // Find tachyon and quantum stones, and create a queues of priority
    const tachyonQueue: T.Stone[] = getStoneQueue(items, T.StoneFamily.TACHYON_STONE);
    const quantumQueue: T.Stone[] = getStoneQueue(items, T.StoneFamily.QUANTUM_STONE);

    // Precompute cumulative bonuses, tachyonBonus[i] is the bonus for i tachyon stones inserted
    const tachyonBonus: number[] = [1];
    let cumul = 1;
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

    // Generate candidate sets
    let sets: T.Artifact[][] = [];
    for (const set of getArtifactSets(artifacts, contractFamilies, maxSlot, includeDeflector)) {
        // Complete the set with stone holders
        set.push(...stoneHolders.slice(0, maxSlot - set.length));

        const stoneSlotAmount: number = Math.min(set.reduce((tot, cur) => tot + (cur.stoneSlotAmount ?? 0), 0),
                                                 tachyonQueue.length + quantumQueue.length);

        const [layingBonusEq, shippingBonus, deflectorBonus] = set.reduce(
            ([layingTot, shippingTot, deflectorTot], item) => [
                layingTot*item.layingBonusEq,
                shippingTot*item.shippingBonus,
                deflectorTot+item.deflectorBonus
            ], [1, 1, 0]);

        // try every combinations of tachyon/quantum stones (12 maximum)
        // in both stone families, choose T4 first, T3 second...
        for (let tachyonAmount = 0; tachyonAmount <= Math.min(stoneSlotAmount, tachyonQueue.length); tachyonAmount++) {
            const quantumAmount = stoneSlotAmount - tachyonAmount;

            // Create a copy for later modifications
            const stonedSet = set.map(copyItem);

            stonedSet.tachyonAmount = tachyonAmount;
            stonedSet.quantumAmount = quantumAmount;
            stonedSet.layingBonusEq = round(layingBonusEq*tachyonBonus[tachyonAmount]);
            stonedSet.shippingBonus = round(shippingBonus*quantumBonus[quantumAmount]);
            stonedSet.deflectorBonus = round(deflectorBonus);

            if (minDeflectorBonus <= stonedSet.deflectorBonus) {
                sets.push(stonedSet);
            }
        }
    }
    console.log(sets.length, "candidate sets found");

    // Get optimal sets
    sets.sort((a, b) => b.deflectorBonus - a.deflectorBonus);
    sets = minmaxReduce(sets, 'layingBonusEq', 'shippingBonus', true);

    // Assign stones to artifacts
    for (const set of sets) {
        const { tachyonAmount, quantumAmount } = set;
        set.sort((a, b) => a.family - b.family);
        const setStones = [
            ...tachyonQueue.slice(0, tachyonAmount),
            ...quantumQueue.slice(0, quantumAmount).reverse()
        ];
        for (const artifact of set) {
            artifact.stones = setStones.splice(0, artifact.stoneSlotAmount).reverse();
            artifact.reslotted = true;
        }
        if (setStones.length) {
            console.warn("Unslotted stones", set, setStones);
        }
    }

    return sets;
}


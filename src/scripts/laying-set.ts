import * as T from '@/scripts/types.ts';
import type { EffectKey } from '@/scripts/effects.ts';
import { getEffects, copyItem } from '@/scripts/artifacts.ts';
import { isclose, fcmp, extractParetoFrontier, product, topologicalSort } from '@/scripts/utils.ts';


const MAX_SET_STONE_AMOUNT = 12;

type AnnotatedArtifact = {
    artifacts: T.Artifact[],
    layingBonus: number,
    shippingBonus: number,
    deflectorBonus: number,
    stoneSlot: number, // amount of available stone slot, set to 0 when reslotting is disabled
};

type AnnotatedStone = {
    stone: T.Stone,
    layingBonus: number,
    shippingBonus: number,
    amount: number,
};

export type AnnotatedSet<T> = {
    artifacts: T[],
    layingBonus: number,
    shippingBonus: number,
    deflectorBonus: number,
    stoneSlot: number,
    stoneCount: Map<T.StoneFamily, number>,
    reslotted?: number,
};


export function getOptimalGussets(items: T.Item[], includeStones: boolean = true): T.AllowedGusset[] {
    const gussets: [[number, number], T.AllowedGusset][] = [];

    items.forEach((item: T.Item) => {
        if (item.category !== T.ItemCategory.ARTIFACT) return;
        if (item.family !== T.ArtifactFamily.GUSSET) return;

        const effects = getEffects(item, { recursive: includeStones });

        gussets.push([[
            effects.laying_rate*effects.hab_capacity_mult,
            effects.shipping_mult],
            `artifact-gusset-${item.tier}-${item.rarity}` as T.AllowedGusset]);
    });

    const paretoGussets = extractParetoFrontier(gussets);

    const gussetsSet: T.AllowedGusset[] = [];
    for (const group of paretoGussets) {
        for (const gusset of group) {
            if (gussetsSet.includes(gusset)) continue;
            gussetsSet.push(gusset);
        }
    }
    return gussetsSet;
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
            count += (artifact as T.Item).quantity ?? 1;
        }
        if (artifact.stones?.some(stone => stone && stone.family === T.StoneFamily.QUANTUM_STONE)) {
            count += (artifact as T.Item).quantity ?? 1;
        }
    }
    return count;
}


/*
 * Count the amount of items in a list, adding all quantities
 */
function countQuantity(items: (T.Item|null)[]): number {
    return items.reduce((sum, item) => sum + (item ? item.quantity ?? 1 : 0), 0);
}


function prepareItems(items: T.Item[],
                      unslot: boolean,
                      slot: boolean
                     ): {
                         artifacts: Map<T.ArtifactFamily, AnnotatedArtifact[]>,
                         stones: Map<T.StoneFamily, AnnotatedStone[]>,
                     } {
    const artifacts = new Map<T.ArtifactFamily, AnnotatedArtifact[]>();
    const stones = new Map<T.StoneFamily, AnnotatedStone[]>();

    const effectList: EffectKey[] = [
        'hab_capacity_mult',
        'laying_rate',
        'shipping_mult',
        'team_laying_bonus',
    ];

    function addArtifact(artifact: T.Artifact) {
        const family = artifact.family;
        const stoneSlot = slot ? unslot ? artifact.stones.length : artifact.stones.filter(x => x === null).length : 0;

        const effects = getEffects(artifact, { recursive: !unslot });

        // If no effect detected and there's no potential through stones, skip
        if (stoneSlot == 0 && effects.isDefault(effectList)) return;

        for (let i = 0; i < artifact.stones.length; i++) {
            const stone = artifact.stones[i];
            if (!stone) continue;
            stone.reslotted = unslot;
        }

        if (!artifacts.has(family)) {
            artifacts.set(family, []);
        }
        artifacts.get(family)!.push({
            artifacts: [artifact],
            layingBonus: effects.laying_rate * effects.hab_capacity_mult,
            shippingBonus: effects.shipping_mult,
            deflectorBonus: effects.team_laying_bonus,
            stoneSlot,
        });

    }

    function addStone(stone: T.Stone) {
        const family = stone.family;
        const effects = getEffects(stone, { recursive: !unslot });

        if (effects.isDefault(effectList)) return;

        if (!stones.has(family)) {
            stones.set(family, []);
        }
        stones.get(family)!.push({
            stone: stone,
            layingBonus: effects.laying_rate * effects.hab_capacity_mult,
            shippingBonus: effects.shipping_mult,
            amount: stone.quantity ?? 1,
        });

    }

    for (const item of items) {
        switch (item.category) {
            case T.ItemCategory.ARTIFACT:
                addArtifact(copyItem(item) as T.Artifact);
                if (unslot) {
                    for (const stone of (item as T.Artifact).stones) {
                        if (stone) addStone(copyItem(stone) as T.Stone);
                    }
                }
                break;
            case T.ItemCategory.STONE:
                addStone(copyItem(item) as T.Stone);
                break;
        }
    }

    for (const [family, artifactList] of artifacts) {

        // Remove dominated artifacts
        const paretoList: AnnotatedArtifact[][] = extractParetoFrontier(artifactList.map(x => [[
            x.layingBonus,
            x.shippingBonus,
            x.deflectorBonus,
            x.stoneSlot,
        ], x]));

        // flatten equivalence groups and mutualize effects
        const filteredArtifacts: AnnotatedArtifact[] = paretoList.map(x => ({
            artifacts: x.flatMap(y => y.artifacts),
            layingBonus: x[0].layingBonus,
            shippingBonus: x[0].shippingBonus,
            deflectorBonus: x[0].deflectorBonus,
            stoneSlot: x[0].stoneSlot,
        }));

        if (filteredArtifacts.length) {
            artifacts.set(family, filteredArtifacts);
        } else {
            artifacts.delete(family);
        }
    }

    for (const stoneList of stones.values()) {
        stoneList.sort((a,b) => b.layingBonus*b.shippingBonus - a.layingBonus*a.shippingBonus);
    }

    return { artifacts, stones };
}

export function computeOptimalSets(items: T.Item[],
                                   maxSlot: number,
                                   reslotting: 0|1|2|3,
                                   deflectorMode: T.DeflectorMode,
                                   allowedGusset: T.AllowedGusset,
                                  ): AnnotatedSet<T.Artifact | null>[][] {
                                  //): AnnotatedSet<T.Artifact | null>[][] {
    const filteredItems = allowedGusset === T.AllowedGusset.ANY ? items : items.filter(x => {
        if (x.category !== T.ItemCategory.ARTIFACT) return true;
        if (x.family !== T.ArtifactFamily.GUSSET) return true;
        return allowedGusset === `artifact-gusset-${x.tier}-${x.rarity}`;
    });

    const { artifacts, stones } = prepareItems(filteredItems, (reslotting & 2) === 2, (reslotting & 1) === 1);

    // In teamwork mode, only keep the highest deflector bonus
    if (deflectorMode === T.DeflectorMode.TEAMWORK) {
        const deflectors = artifacts.get(T.ArtifactFamily.TACHYON_DEFLECTOR) ?? [];

        const bestBonus = Math.max(...deflectors.map(x => x.deflectorBonus));
        const bestDeflectors = deflectors.filter(x => isclose(x.deflectorBonus, bestBonus));

        artifacts.set(T.ArtifactFamily.TACHYON_DEFLECTOR, bestDeflectors);
    }


    // Precomputed cumulative bonuses for stones
    // stonesBonus[fam][i] is the bonus for i stones in fam family
    const stonesBonus = new Map<T.StoneFamily, { layingBonus: number, shippingBonus: number }[]>();
    const stonesQueue = new Map<T.StoneFamily, T.Stone[]>();
    for (const [family, list] of stones) {
        let layingBonus = 1, shippingBonus = 1;
        const bonus = [{ layingBonus, shippingBonus }];
        const queue = [];
        for (const stone of list) {
            for (let i = 0; i < stone.amount; i++) {
                layingBonus *= stone.layingBonus;
                shippingBonus *= stone.shippingBonus;
                bonus.push({ layingBonus, shippingBonus });
                queue.push(stone.stone);
                if (bonus.length > MAX_SET_STONE_AMOUNT) break;
            }
            if (bonus.length > MAX_SET_STONE_AMOUNT) break;
        }
        stonesBonus.set(family, bonus);
        stonesQueue.set(family, queue);
    }


    const optionalFamilies = Object.values(T.ArtifactFamily).filter(family => !isNaN(Number(family))) as T.ArtifactFamily[];
    const requiredFamilies = [
        ...(deflectorMode !== T.DeflectorMode.NONE ?
            [T.ArtifactFamily.TACHYON_DEFLECTOR] : []),
        ...(allowedGusset !== T.AllowedGusset.ANY && allowedGusset !== T.AllowedGusset.NONE ?
            [T.ArtifactFamily.GUSSET] : []),
    ];

    const sets: AnnotatedSet<AnnotatedArtifact>[] = [];
    let cnt0 = 0, cnt1 = 0, cnt2 = 0;
    for (const familySet of getFamilyCombinations(requiredFamilies, optionalFamilies, maxSlot, artifacts)) {
        cnt0++;
        for (const set of product(...familySet.map(family => artifacts.get(family) ?? []))) {
            const layingBonus    = set.reduce((tot, cur) => tot * cur.layingBonus   , 1);
            const shippingBonus  = set.reduce((tot, cur) => tot * cur.shippingBonus , 1);
            const deflectorBonus = set.reduce((tot, cur) => tot + cur.deflectorBonus, 0);
            const stoneSlot      = set.reduce((tot, cur) => tot + cur.stoneSlot     , 0);
            cnt1++;

            for (const stoneComb of getStoneCombinations(stonesBonus, stoneSlot)) {
                cnt2++;
                sets.push({
                    artifacts: set,
                    layingBonus: layingBonus * stoneComb.layingBonus,
                    shippingBonus: shippingBonus * stoneComb.shippingBonus,
                    deflectorBonus,
                    stoneSlot,
                    stoneCount: stoneComb.counts,
                });
            }
        }
    }
    console.log(cnt0, "family combinations,", cnt1, "artifact sets,", cnt2, "slotted artifact sets");

    // Extract non-dominated sets
    // This is the slow part, which is why we reduced the amount of family sets and artifact sets beforehand
    // extractParetoFrontier is allowed to use the faster specialized algorithm for 2 coordinates
    const paretoSets: AnnotatedSet<AnnotatedArtifact>[][] = extractParetoFrontier(sets.map(x => [
        [x.layingBonus, x.shippingBonus], x
    ]));

    // At this point, paretoSets is an array of groups,
    // each group is an array of equivalent sets regarding max laying rate and shipping rate,
    // each set is an array of annotated artifacts (equivalent artifacts)
    // We expand artifact groups so we now have sets with actual artifacts
    let optimalSets: AnnotatedSet<T.Artifact | null>[][] = paretoSets.map(group => {
        const bestDeflectorBonus = Math.max(...group.map(x => x.deflectorBonus));
        const result: AnnotatedSet<T.Artifact | null>[] = [];
        for (const set of group) {
            // Ignore this set if there are better alternative regarding deflectors
            if (!isclose(set.deflectorBonus, bestDeflectorBonus)) continue

            for (const x of product(...set.artifacts.map(x => x.artifacts))) {
                result.push({
                    artifacts: x,
                    layingBonus: set.layingBonus,
                    shippingBonus: set.shippingBonus,
                    deflectorBonus: set.deflectorBonus,
                    stoneSlot: set.stoneSlot,
                    stoneCount: set.stoneCount,
                });
            }
        }
        return result;
    });

    // Assign stones to optimalSets
    let cnt3 = 0;
    optimalSets = optimalSets.map(group => {
        let result: AnnotatedSet<T.Artifact | null>[] = [];
        let bestReslottedAmount = Infinity;
        for (const set of group) {
            cnt3++;
            const pickedStones: T.Stone[] = [...set.stoneCount.entries()]
                .flatMap(([fam, n]) => (stonesQueue.get(fam) ?? []).slice(0, n));
            const reslottedSet = assignStones(set as AnnotatedSet<T.Artifact>, pickedStones, bestReslottedAmount);
            if (!reslottedSet) continue;
            if (reslottedSet.reslotted! < bestReslottedAmount) {
                bestReslottedAmount = reslottedSet.reslotted!;
                result = [reslottedSet];
            } else if (reslottedSet.reslotted! === bestReslottedAmount) {
                result.push(reslottedSet);
            } else {
            }
        }
        return result;
    });
    console.log(optimalSets.length, "solution groups,", cnt3, "reslotting tested");
    console.log("Solution groups sizes:", optimalSets.map(x => x.length));


    // Sort sets by family and fill empty slots with null
    optimalSets.forEach(group => group.forEach(set => {
         set.artifacts.sort((a,b) => a!.family - b!.family);
         while (set.artifacts.length < maxSlot) set.artifacts.push(null);
    }));
    // Sort solutions with most common artifacts first (usually prefered for stone holding)
    optimalSets.forEach(group => group.sort((a,b) => countQuantity(b.artifacts) - countQuantity(a.artifacts)));


    return optimalSets;
}

function* getFamilyCombinations(requiredFamilies: T.ArtifactFamily[],
                                optionalFamilies: T.ArtifactFamily[],
                                maxSlot: number,
                                artifacts: Map<T.ArtifactFamily, AnnotatedArtifact[]>
                               ): Generator<T.ArtifactFamily[], void, void> {
    if (maxSlot < requiredFamilies.length) return;

    optionalFamilies = optionalFamilies.filter(x => !requiredFamilies.includes(x)
                                                 && (artifacts.get(x) ?? []).length > 0);

    //
    const slottedCount = new Map<T.ArtifactFamily, number>();
    const quantityCount = new Map<T.ArtifactFamily, number>();
    for (const f of optionalFamilies) {
        const l = artifacts.get(f) ?? [];
        slottedCount.set(f, l.reduce((tot, cur) => tot + countSlotted(cur.artifacts), 0));
        quantityCount.set(f, l.reduce((tot, cur) => tot + countQuantity(cur.artifacts), 0));
    }
    // This order is not strictly followed, since we require a topological order later on
    // But it nudges the final order nevertheless
    optionalFamilies.sort((a, b) => slottedCount.get(b)! - slottedCount.get(a)!
                                 || quantityCount.get(b)! - quantityCount.get(a)!);

    // For each family, contains the list of families that are strictly better
    // A family cannot be added if a dominating family is not already present
    const dominations = new Map<T.ArtifactFamily, T.ArtifactFamily[]>();

    // returns true if fa strictly dominates fb
    function dominates(fa: T.ArtifactFamily, fb: T.ArtifactFamily) {
        const la: AnnotatedArtifact[] = artifacts.get(fa) ?? [];
        const lb: AnnotatedArtifact[] = artifacts.get(fb) ?? [];
        for (const b of lb) {
            let isDominated = false;
            for (const a of la) {
                // Use the t4 of tachyon and quantum stones to calculate maximum potential of artifacts once
                // slotted. We check if the best case for b is beaten by worst case for a
                // We assume infinite availability of t2 stones
                const stoneBonus = 1.05**Math.max(0, b.stoneSlot - a.stoneSlot)
                                 / 1.02**Math.max(0, a.stoneSlot - b.stoneSlot);

                // If a strictly worse on one stat, stay on isDominated = false and go to next a
                if (fcmp(a.layingBonus, b.layingBonus*stoneBonus)) continue;
                if (fcmp(a.shippingBonus, b.shippingBonus*stoneBonus)) continue;
                if (fcmp(a.deflectorBonus, b.deflectorBonus)) continue;

                // If a is strictly better on one stat, set isDominated to true and break the loop
                isDominated = true;
                if (fcmp(b.layingBonus*stoneBonus, a.layingBonus)) break;
                if (fcmp(b.shippingBonus*stoneBonus, a.shippingBonus)) break;
                if (fcmp(b.deflectorBonus, a.deflectorBonus)) break;

                // If a is equivalent on all stats, reset isDominated to false for next a
                isDominated = false;

                // Generic version that doesn't use hardcoded stone values and assumptions
                /*
                // If a strictly worse on one stat, stay on isDominated = false and go to next a
                if (a.stoneSlot < b.stoneSlot) continue;
                if (fcmp(a.layingBonus < b.layingBonus)) continue;
                if (fcmp(a.shippingBonus < b.shippingBonus)) continue;
                if (fcmp(a.deflectorBonus < b.deflectorBonus)) continue;

                // If a is strictly better on one stat, set isDominated to true and break the loop
                isDominated = true;
                if (a.stoneSlot > b.stoneSlot) break;
                if (fcmp(b.layingBonus < a.layingBonus)) continue;
                if (fcmp(b.shippingBonus < a.shippingBonus)) continue;
                if (fcmp(b.deflectorBonus < a.deflectorBonus)) continue;

                // If a is equivalent on all stats, reset isDominated to false for next a
                isDominated = false;
                */
            }
            if (!isDominated) {
                return false;
            }
        }
        return true;
    }

    for (const family of optionalFamilies) {
        dominations.set(family, []);
        for (const other of optionalFamilies) {
            if (family === other) continue;
            if (dominates(other, family)) {
                dominations.get(family)!.push(other);
            }
            if (dominations.get(family)!.length >= 4) {
                // Max slot is 4, so we can stop early once we have 4 dependencies
                break;
            }
        }
    }

    optionalFamilies = topologicalSort(dominations, true);

    function* aux(index: number = 0,
                  current: T.ArtifactFamily[] = [...requiredFamilies]
                 ): Generator<T.ArtifactFamily[], void, void> {
        if (current.length === maxSlot) {
            yield [...current];
            return;
        } else if (current.length > maxSlot) {
            return;
        }
        for (let i = index; i < optionalFamilies.length; i++) {
            if (dominations.get(optionalFamilies[i])!.some(x => !current.includes(x))) continue;
            current.push(optionalFamilies[i]);
            yield* aux(i+1, current);
            current.pop();
        }
    }
    yield* aux();
    // Naive combinations
    /*
    for (const comb of combinations(optionalFamilies, maxSlot - requiredFamilies.length, true)) {
        yield [...requiredFamilies, ...comb];
    }
    return;
    */
}

type StoneCombination = {
    layingBonus: number,
    shippingBonus: number,
    counts: Map<T.StoneFamily, number>,
};

function* getStoneCombinations(bonuses: Map<T.StoneFamily, { layingBonus: number, shippingBonus: number }[]>,
                               count: number
                              ): Generator<StoneCombination, void, void> {
    const families = [...bonuses.keys()];

    count = Math.min(count, families.reduce((tot, cur) => tot + bonuses.get(cur)!.length, 0));

    function* aux(count: number, index: number = 0, current: number[] = []): Generator<number[], void, void> {
        if (index === families.length) {
            if (count === 0) yield current;
            //yield new Map<T.StoneFamily, number>(current.map((el, i) => [families[i], el]));
            return;
        }
        for (let i = Math.min(bonuses.get(families[index])!.length-1, count); i >= 0; i--) {
            current[index] = i;
            yield* aux(count-i, index+1, current);
        }
    }
    for (const counts of aux(count)) {
        let layingBonus = 1, shippingBonus = 1;
        for (let i = 0; i < counts.length; i++) {
            const b = bonuses.get(families[i])![counts[i]];
            layingBonus *= b.layingBonus ?? 1;
            shippingBonus *= b.shippingBonus ?? 1;
        }
        yield { layingBonus, shippingBonus, counts: new Map(counts.map((el, i) => [families[i], el])) };
    }
}

function assignStones(set: AnnotatedSet<T.Artifact>,
                      stones: T.Stone[],
                      maxReslotAmount: number = Infinity,
                     ): AnnotatedSet<T.Artifact> | null {
    const stoneKey = (s: T.Stone | null) => s ? `${s.category}-${s.family}-${s.tier}` : "null";

    const stoneCount = new Map<string, number>();
    for (const stone of stones) {
        const key = stoneKey(stone);
        stoneCount.set(key, (stoneCount.get(key) || 0) + 1);
    }

    const slotsToFill: Array<{ artiIdx: number, stoneIdx: number }> = [];
    const slotsToKeep: Array<{ artiIdx: number, stoneIdx: number }> = [];

    for (const [artiIdx, artifact] of set.artifacts.entries()) {
        for (let i = 0; i < (artifact.stones?.length ?? 0); i++) {
            const stone = artifact.stones[i];
            const key = stoneKey(stone);
            if (stone && !stone.reslotted) continue;
            if (stone === null) {
                // Stone to change in priority
                slotsToFill.unshift({ artiIdx, stoneIdx: i });
            } else if ((stoneCount.get(key) || 0) > 0) {
                // Stone to keep
                stoneCount.set(key, stoneCount.get(key)! - 1);
                slotsToKeep.push({ artiIdx, stoneIdx: i });
            } else {
                // Stone to change in last
                slotsToFill.push({ artiIdx, stoneIdx: i });
            }
        }
    }

    if (slotsToFill.length > maxReslotAmount) return null;

    const result: AnnotatedSet<T.Artifact> = {
        artifacts: set.artifacts.map(copyItem) as T.Artifact[],
        layingBonus: set.layingBonus,
        shippingBonus: set.shippingBonus,
        deflectorBonus: set.deflectorBonus,
        stoneSlot: set.stoneSlot,
        stoneCount: new Map(),
        reslotted: (set.reslotted ?? 0) + slotsToFill.length,
    }

    const remainingStones: T.Stone[] = [];
    for (const stone of stones) {
        const key = stoneKey(stone);
        if ((stoneCount.get(key) || 0) > 0) {
            remainingStones.push(stone);
            stoneCount.set(key, stoneCount.get(key)! - 1);
        }
    }

    for (const { artiIdx, stoneIdx } of slotsToKeep) {
        result.artifacts[artiIdx].stones[stoneIdx]!.reslotted = false;
    }

    for (let i = 0; i < slotsToFill.length && i < remainingStones.length; i++) {
        const { artiIdx, stoneIdx } = slotsToFill[i];
        result.artifacts[artiIdx].stones[stoneIdx] = remainingStones[i];
        result.artifacts[artiIdx].stones[stoneIdx].reslotted = true;
        result.artifacts[artiIdx].reslotted = (result.artifacts[artiIdx].reslotted ?? 0) + 1;
    }

    return result;
}


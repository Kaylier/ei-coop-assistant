/**
 * Generic artifact set solver
 *
 * See boosting-set.ts for examples on how to use
 */
import * as T from '@/scripts/types.ts';
import { arrayCompare, extractParetoFrontier, product } from '@/scripts/utils.ts';
import { getEffects, copyItem } from '@/scripts/artifacts.ts';
import { Effects } from '@/scripts/effects.ts';
import type { EffectKey } from '@/scripts/effects.ts';


type AnnotatedArtifact = {
    artifacts: T.Artifact[],
    effects: Effects,
    stoneSlot: number, // amount of available stone slot, set to 0 when reslotting is disabled
};

type AnnotatedStone = {
    stone: T.Stone,
    effects: Effects,
};



/**
 * Regroup artifacts and stone by family and by equivalent effects
 * If unslot is set, slotted stones effects are ignored, and their slots are counted as available
 * If slot is set, stoneSlot is populated
 * Different combinations lead to these interpretations:
 *      (false, false): without reslotting
 *      (false, true ): allows to insert new stones
 *      (true , false): ignores stones
 *      (true , true ): with reslotting
 * mainEffects is a list of effect keys that must have a non-default value for an artifact to be considered.
 * secondaryEffects is a list of effect keys that are considered for pruning dominated elements.
 * If mainEffects or secondaryEffects are not set, use all effects
 */
export function prepareItems(items: T.Item[],
                             unslot: boolean,
                             slot: boolean,
                             mainEffects?: EffectKey[],
                             secondaryEffects?: EffectKey[],
                            ): {
                                artifacts: Map<T.ArtifactFamily, AnnotatedArtifact[]>,
                                stones: Map<T.StoneFamily, AnnotatedStone[]>,
                            } {
    const artifacts = new Map<T.ArtifactFamily, AnnotatedArtifact[]>();
    const stones = new Map<T.StoneFamily, AnnotatedStone[]>();

    // Make sure mainEffects are included in filteredEffects
    const filteredEffects = secondaryEffects ? [...(mainEffects ?? []), ...secondaryEffects] : undefined;

    function addArtifact(artifact: T.Artifact) {
        const family = artifact.family;
        const stoneSlot = slot ? unslot ? artifact.stones.length : artifact.stones.filter(x => x === null).length : 0;

        const effects = getEffects(artifact, { recursive: !unslot, targets: filteredEffects });

        // If no effect detected and there's no potential through stones, skip
        if (stoneSlot == 0 && effects.isDefault(mainEffects)) return;

        for (let i = 0; i < artifact.stones.length; i++) {
            const stone = artifact.stones[i];
            if (!stone) continue;
            stone.reslotted = unslot;
        }

        if (!artifacts.has(family)) {
            artifacts.set(family, []);
        }
        artifacts.get(family)!.push({ artifacts: [artifact], effects, stoneSlot });

    }

    function addStone(stone: T.Stone) {
        const family = stone.family;
        const effects = getEffects(stone, { recursive: !unslot, targets: filteredEffects });

        if (effects.isDefault(mainEffects)) return;

        if (!stones.has(family)) {
            stones.set(family, []);
        }
        for (let i = stone.quantity ?? 1; i; i--) {
            stones.get(family)!.push({ stone: stone, effects: effects });
        }

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
        const effectList = Array.from(new Set(artifactList.flatMap(x => [...x.effects.keys()])));

        // Remove dominated artifacts
        const paretoList: AnnotatedArtifact[][] = extractParetoFrontier(artifactList.map(x => [[
            x.stoneSlot, ...effectList.map(eff => x.effects.getScore(eff))
        ], x]));

        // flatten equivalence groups and mutualize effects
        const filteredArtifacts: AnnotatedArtifact[] = paretoList.map(x => ({
            artifacts: x.flatMap(y => y.artifacts),
            effects: x[0].effects,
            stoneSlot: x[0].stoneSlot,
        }));

        artifacts.set(family, filteredArtifacts);
    }

    return { artifacts, stones };
}



/**
 * Recursively search for an artifact set that maximizes an objective function.
 * artifacts and stones are object returned by prepareItems
 * maxSlot is the maximum amount of slot in a set
 * scoreFn is the objective function
 * artifact and stone families that are considered can be specified to add restrictions
 */
export function searchSet(artifacts: Map<T.ArtifactFamily, AnnotatedArtifact[]>,
                          stones: Map<T.StoneFamily, AnnotatedStone[]>,
                          maxSlot: number,
                          scoreFn: (effect: Effects) => number[],
                          options?: {
                              requiredFamilies?: T.ArtifactFamily[],
                              optionalFamilies?: T.ArtifactFamily[],
                              stoneFamilies?: T.StoneFamily[],
                              minimumScore?: number[],
                              userEffects?: Effects,
                          }): T.ArtifactSet | null {
    let { requiredFamilies, optionalFamilies, stoneFamilies } = options ?? {};
    const { minimumScore, userEffects } = options ?? {};

    function itemCompare<A extends { effects: Effects }>(a: A, b: A) {
        const aeff = new Effects(userEffects ?? Effects.initial, a.effects);
        const beff = new Effects(userEffects ?? Effects.initial, b.effects);
        return arrayCompare(scoreFn(aeff), scoreFn(beff));
    }

    // Sort candidate artifacts, most promising first
    for (const cands of artifacts.values()) {
        cands.sort((a,b) => itemCompare(b, a) || b.stoneSlot - a.stoneSlot);
    }

    // Sort candidate stones, most promising first, and remove useless ones
    for (const cands of stones.values()) {
        cands.sort((a,b) => itemCompare(b, a));
    }

    // Sort artifact families, most promising first, preceeded by required families
    requiredFamilies = requiredFamilies || [];
    const requiredIdx = requiredFamilies.length;
    optionalFamilies = optionalFamilies || [...artifacts.keys()];
    optionalFamilies = optionalFamilies.filter(x => artifacts.has(x) && artifacts.get(x)!.length > 0);
    optionalFamilies.sort((a,b) => {
        const ita = artifacts.get(a)![0], itb = artifacts.get(b)![0];
        return itemCompare(itb, ita) || itb.stoneSlot - ita.stoneSlot;
    });
    const artifactFamilies = requiredFamilies.concat(optionalFamilies);

    // Sort stone families, most promising first
    stoneFamilies = stoneFamilies || [...stones.keys()];
    stoneFamilies = stoneFamilies.filter(x => stones.has(x) && stones.get(x)!.length > 0);
    stoneFamilies.sort((a,b) => {
        const ita = stones.get(a)![0], itb = stones.get(b)![0];
        return itemCompare(itb, ita);
    });

    // Create upper bound effects in each families (max reachable on every keys)
    const upperBound = new Map<T.ArtifactFamily, Effects>()
    for (const [family, values] of artifacts) {
        upperBound.set(family, Effects.getBound(...values.map(x => x.effects)));
    }


    let solutions: { artifacts: AnnotatedArtifact[], stones: AnnotatedStone[] }[] = []
    let bestScore: number[] = minimumScore ?? [];

    // Recursion on families
    function rec(current: AnnotatedArtifact[] = [], idx: number = 0): number {
        let callCount = 1;

        const baseEffects = new Effects(userEffects ?? Effects.initial, ...current.map(x => x.effects));
        const stoneCount = current.reduce((tot,cur) => tot + cur.stoneSlot, 0);

        // evaluate current (only if all required families have been added)
        if (idx >= requiredIdx) {
            const { currentStones, effects } = findStones(baseEffects, stoneCount);
            const score = scoreFn(effects);
            const compareResult = arrayCompare(score, bestScore);
            if (compareResult > 0) {
                solutions = [];
            }
            if (compareResult >= 0) {
                solutions.push({ artifacts: [...current], stones: [...currentStones] });
                bestScore = score;
            }
        }

        if (current.length >= maxSlot || idx >= artifactFamilies.length) {
            return callCount;
        }

        // evaluate current score upper bound and early-abort if bestScore cannot be reached
        const boundEffects = Effects.getBound(...artifactFamilies.slice(idx).map(f => upperBound.get(f) ?? new Effects()));
        for (let i = current.length; i < maxSlot; i++) baseEffects.merge(boundEffects);
        const { effects } = findStones(baseEffects, stoneCount + (maxSlot - current.length)*3);
        const scoreMax = scoreFn(effects);
        if (arrayCompare(scoreMax, bestScore) < 0) {
            return callCount;
        }

        // recurse
        for (const candidate of (artifacts.get(artifactFamilies[idx]) ?? [])) {
            current.push(candidate);
            callCount += rec(current, idx+1);
            current.pop();
        }
        if (idx >= requiredIdx) {
            callCount += rec(current, idx+1);
        }
        return callCount;
    }

    // Find best stones to put in, using effects as base
    function findStones(baseEffects: Effects, stoneCount: number)  {
        // Warning: this approach is vulnerable to local minima
        const effects = new Effects(baseEffects);

        const currentStones: AnnotatedStone[] = [];
        const stonesIndices = new Map<T.StoneFamily, number>();

        // Insert one stone at a time
        for (let i = 0; i < stoneCount; i++) {
            // Pick the family that gives the highest marginal gain
            let bestScore: number[] = [];
            let bestFamily: T.StoneFamily|null = null;

            for (const family of stoneFamilies!) {
                const index = stonesIndices.get(family) ?? 0;
                const stoneQueue = stones.get(family) ?? [];
                if (index >= stoneQueue.length) continue;

                const familyScore = scoreFn(new Effects(effects, stoneQueue[index].effects));
                if (arrayCompare(familyScore, bestScore) > 0) {
                    bestScore = familyScore;
                    bestFamily = family;
                }
            }
            if (bestFamily === null) break;

            const index = stonesIndices.get(bestFamily) ?? 0;
            const stone = stones.get(bestFamily)![index];
            currentStones.push(stone);
            effects.merge(stone.effects);
            stonesIndices.set(bestFamily, index + 1);

        }

        return { currentStones, effects };
    }

    // Find the best sets+stone queues and store them in the variable solutions (an array of equivalent solutions)
    const callCount = rec();
    const solutionCount = solutions.reduce((tot, solution) => tot + solution.artifacts.reduce((tot, cur) => tot*cur.artifacts.length, 1), 0);
    console.log(callCount, "trials,", solutions.length, "candidate sets,", solutionCount, "reslotting options");
    if (solutions.length == 0) return null;

    const set: (T.Artifact|null)[] = findMinimalReslotting(solutions).sort((a,b) => a.family - b.family);
    while (set.length < maxSlot) set.push(null);

    return {
        set: set,
        effects: new Effects(...set.map(x => getEffects(x))),
    };
}



/**
 * Return a minimal reslotting solution from a general list of candidate solutions.
 */
function findMinimalReslotting(solutions: { artifacts: AnnotatedArtifact[], stones: AnnotatedStone[] }[]): T.Artifact[] {
    // There is potential for optimization in case of performances issues
    let best: T.Artifact[] | null = null;
    let bestScore: number = Infinity;

    iter:
    for (const { artifacts, stones } of solutions) {

        const stoneKey = (s: T.Stone | null) => s ? `${s.category}-${s.family}-${s.tier}` : "null";
        const stoneCount = new Map<string, number>();
        for (const stone of stones) {
            const key = stoneKey(stone.stone);
            stoneCount.set(key, (stoneCount.get(key) || 0) + 1);
        }

        function reslotScore(set: T.Artifact[]) {
            const missing = new Map<string, number>(stoneCount);
            for (const artifact of set) {
                for (const stone of artifact.stones) {
                    if (!stone) continue;
                    const key = stoneKey(stone);
                    missing.set(key, (missing.get(key) || 0) - 1);
                }
            }
            return [...missing.values()].reduce((tot,cur) => tot + Math.max(0, cur), 0);
        }

        for (const candidateSet of product(...artifacts.map(x => x.artifacts))) {
            const score = reslotScore(candidateSet);
            if (score < bestScore) {
                best = candidateSet.map(x => copyItem(x) as T.Artifact);
                assignStones(best, stones.map(x => x.stone));
                bestScore = score;
                if (score == 0) break iter;
            }
        }
    }

    return best !== null ? best : [];
}



/**
 * Assign stones in a set, while minimizing reslotting actions
 */
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
            const stone = artifact.stones[i];
            const key = stoneKey(stone);
            if (stone && !stone.reslotted) continue;
            if (stone === null) {
                // Stone to change in priority
                slotsToFill.push({ artifact, index: i });
            } else if ((stoneCount.get(key) || 0) > 0) {
                // Stone to keep
                stoneCount.set(key, stoneCount.get(key)! - 1);
                stone.reslotted = false;
            } else {
                // Stone to change in last
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

    for (let i = 0; i < slotsToFill.length && i < remainingStones.length; i++) {
        const { artifact, index } = slotsToFill[i];
        artifact.stones[index] = remainingStones[i];
        artifact.stones[index].reslotted = true;
        artifact.reslotted = (artifact.reslotted ?? 0) + 1;
    }

    return reslottedCount;
}





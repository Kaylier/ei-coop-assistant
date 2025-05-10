import * as T from '@/scripts/types.ts';
import { getEffects } from '@/scripts/artifacts.ts';
import { prepareItems, searchSet } from '@/scripts/solvers.ts';
import { Effects } from '@/scripts/effects.ts';


export function searchEBSet(items: T.Item[],
                            maxSlot: number,
                            userEffects: Effects,
                            countCube: boolean,
                            countMonocle: boolean,
                            online: boolean,
                            reslotting: 0|1|2|3): T.ArtifactSet | null {

    const { artifacts, stones } = prepareItems(items, (reslotting & 2) === 2, (reslotting & 1) === 1, [
        'prophecy_egg_bonus',
        'soul_egg_bonus',
        'laying_rate',
        'egg_value_mult',
        'earning_mrcb_mult',
        'earning_away_mult',
        'research_cost_mult',
        'team_earning_bonus',
    ]);

    function scoreFn(effects: Effects): number[] {
        const eb = effects.eb;

        const bonus = effects.laying_rate
                    * effects.egg_value_mult
                    * effects.earning_mult
                    * (online ? effects.earning_mrcb_mult : effects.earning_away_mult)
                    / (countCube ? effects.research_cost_mult : 1);

        return [
            eb,
            effects.team_earning_bonus,
            (1 + eb)*bonus,
            1/effects.research_cost_mult,
        ];
    }

    return searchSet(artifacts, stones, maxSlot, scoreFn, {
        optionalFamilies: [...artifacts.keys()],
        stoneFamilies: [
            T.StoneFamily.PROPHECY_STONE,
            T.StoneFamily.SOUL_STONE,
            T.StoneFamily.TERRA_STONE,
            T.StoneFamily.TACHYON_STONE,
            T.StoneFamily.SHELL_STONE,
            T.StoneFamily.LUNAR_STONE,
        ],
        userEffects,
    });
}


export function searchEarningSet(items: T.Item[],
                                 maxSlot: number,
                                 userEffects: Effects,
                                 countCube: boolean,
                                 countMonocle: boolean,
                                 online: boolean,
                                 reslotting: 0|1|2|3): T.ArtifactSet | null {

    const { artifacts, stones } = prepareItems(items, (reslotting & 2) === 2, (reslotting & 1) === 1, [
        'prophecy_egg_bonus',
        'soul_egg_bonus',
        'laying_rate',
        'egg_value_mult',
        'earning_mrcb_mult',
        'earning_away_mult',
        'research_cost_mult',
        'team_earning_bonus',
    ]);

    function scoreFn(effects: Effects): number[] {
        const eb = effects.eb;

        const bonus = effects.laying_rate
                    * effects.egg_value_mult
                    * effects.earning_mult
                    * (online ? effects.earning_mrcb_mult : effects.earning_away_mult)
                    / (countCube ? effects.research_cost_mult : 1);

        return [
            (1 + eb)*bonus,
            effects.team_earning_bonus,
            1/effects.research_cost_mult,
        ];
    }

    return searchSet(artifacts, stones, maxSlot, scoreFn, {
        optionalFamilies: [...artifacts.keys()],
        stoneFamilies: [
            T.StoneFamily.PROPHECY_STONE,
            T.StoneFamily.SOUL_STONE,
            T.StoneFamily.TERRA_STONE,
            T.StoneFamily.TACHYON_STONE,
            T.StoneFamily.SHELL_STONE,
            T.StoneFamily.LUNAR_STONE,
        ],
        userEffects,
    });
}


export function searchMirrorSet(items: T.Item[],
                                maxSlot: number,
                                userEffects: Effects,
                                countCube: boolean,
                                countMonocle: boolean,
                                online: boolean,
                                reslotting: 0|1|2|3): T.ArtifactSet | null {

    const { artifacts, stones } = prepareItems(items, (reslotting & 2) === 2, (reslotting & 1) === 1, [
        'prophecy_egg_bonus',
        'soul_egg_bonus',
        'laying_rate',
        'egg_value_mult',
        'earning_mrcb_mult',
        'earning_away_mult',
        'research_cost_mult',
    ]);

    function scoreFn(effects: Effects): number[] {
        const bonus = effects.laying_rate
                    * effects.egg_value_mult
                    * effects.earning_mult
                    * (online ? effects.earning_mrcb_mult : effects.earning_away_mult)
                    / (countCube ? effects.research_cost_mult : 1);

        return [ bonus, 1/effects.research_cost_mult ];
    }

    return searchSet(artifacts, stones, maxSlot, scoreFn, {
        optionalFamilies: [...artifacts.keys()],
        stoneFamilies: [
            T.StoneFamily.PROPHECY_STONE,
            T.StoneFamily.SOUL_STONE,
            T.StoneFamily.TERRA_STONE,
            T.StoneFamily.TACHYON_STONE,
            T.StoneFamily.SHELL_STONE,
            T.StoneFamily.LUNAR_STONE,
        ],
        userEffects,
    });
}


export function searchCube(items: T.Item[]): [T.Artifact | null, number] {
    return items.reduce<[T.Artifact | null, number]>((best, item) => {
        if (item.category !== T.ItemCategory.ARTIFACT) return best;
        const bonus = getEffects(item).research_cost_mult;
        return bonus < best[1] ? [item, bonus] : best;
    }, [null, 1]);
}



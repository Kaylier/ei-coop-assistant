import * as T from '@/scripts/types.ts';
import { getEffects } from '@/scripts/artifacts.ts';
import { prepareItems, searchSet } from '@/scripts/solvers.ts';
import { Effects } from '@/scripts/effects.ts';



type BaseBonuses = {
    PECount: number,
    SECount: number,
    basePEBonus: number,
    baseSEBonus: number,
    baseRCBonus: number,
};


export function searchEBSet(items: T.Item[],
                            maxSlot: number,
                            baseBonuses: BaseBonuses,
                            countCube: boolean,
                            countMonocle: boolean,
                            online: boolean,
                            reslotting: boolean): T.ArtifactSet | null {

    const { PECount, SECount, basePEBonus, baseSEBonus, baseRCBonus } = baseBonuses;

    const { artifacts, stones } = prepareItems(items, reslotting, reslotting, [
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
        const eb = SECount
                 * (baseSEBonus + effects.get('soul_egg_bonus'))
                 * Math.pow(basePEBonus + effects.get('prophecy_egg_bonus'), PECount);

        const bonus = effects.get('egg_value_mult') * effects.get('laying_rate')
                    * (online ? baseRCBonus + effects.get('earning_mrcb_mult') : effects.get('earning_away_mult'))
                    / (countCube ? effects.get('research_cost_mult') : 1);

        return [
            eb,
            effects.get('team_earning_bonus'),
            (1 + eb)*bonus,
            1/effects.get('research_cost_mult')
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
    });
}


export function searchEarningSet(items: T.Item[],
                                 maxSlot: number,
                                 baseBonuses: BaseBonuses,
                                 countCube: boolean,
                                 countMonocle: boolean,
                                 online: boolean,
                                 reslotting: boolean): T.ArtifactSet | null {
    const { PECount, SECount, basePEBonus, baseSEBonus, baseRCBonus } = baseBonuses;

    const { artifacts, stones } = prepareItems(items, reslotting, reslotting, [
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
        const eb = SECount
                 * (baseSEBonus + effects.get('soul_egg_bonus'))
                 * Math.pow(basePEBonus + effects.get('prophecy_egg_bonus'), PECount);

        const bonus = effects.get('egg_value_mult') * effects.get('laying_rate')
                    * (online ? baseRCBonus + effects.get('earning_mrcb_mult') : effects.get('earning_away_mult'))
                    / (countCube ? effects.get('research_cost_mult') : 1);

        return [
            (1 + eb)*bonus,
            effects.get('team_earning_bonus'),
            1/effects.get('research_cost_mult')
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
    });
}


export function searchMirrorSet(items: T.Item[],
                                maxSlot: number,
                                baseBonuses: BaseBonuses,
                                countCube: boolean,
                                countMonocle: boolean,
                                online: boolean,
                                reslotting: boolean): T.ArtifactSet | null {
    const { baseRCBonus } = baseBonuses;

    const { artifacts, stones } = prepareItems(items, reslotting, reslotting, [
        'prophecy_egg_bonus',
        'soul_egg_bonus',
        'laying_rate',
        'egg_value_mult',
        'earning_mrcb_mult',
        'earning_away_mult',
        'research_cost_mult',
    ]);

    function scoreFn(effects: Effects): number[] {
        const bonus = effects.get('egg_value_mult') * effects.get('laying_rate')
                    * (online ? baseRCBonus + effects.get('earning_mrcb_mult') : effects.get('earning_away_mult'))
                    / (countCube ? effects.get('research_cost_mult') : 1);

        return [ bonus, 1/effects.get('research_cost_mult') ];
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
    });
}


export function searchCube(items: T.Item[]): [T.Artifact | null, number] {
    return items.reduce<[T.Artifact | null, number]>((best, item) => {
        if (item.category !== T.ItemCategory.ARTIFACT) return best;
        const bonus = getEffects(item).get('research_cost_mult');
        return bonus < best[1] ? [item, bonus] : best;
    }, [null, 1]);
}



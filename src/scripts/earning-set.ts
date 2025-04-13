import * as T from '@/scripts/types.ts';
import { EffectMap, getEffects } from '@/scripts/artifacts.ts';
import { prepareItems, searchSet } from '@/scripts/solvers.ts';



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
        'laying_bonus',
        'egg_value_bonus',
        'running_chicken_bonus',
        'away_earning_bonus',
        'research_cost_bonus',
    ]);

    function scoreFn(effects: EffectMap): number[] {
        const eb = SECount
                 * (baseSEBonus + effects.get('soul_egg_bonus'))
                 * Math.pow(basePEBonus + effects.get('prophecy_egg_bonus'), PECount);

        const bonus = effects.get('egg_value_bonus') * effects.get('laying_bonus')
                    * (online ? baseRCBonus + effects.get('running_chicken_bonus') : effects.get('away_earning_bonus'))
                    / (countCube ? effects.get('research_cost_bonus') : 1);

        //return [ eb, 1/effects.get('research_cost_bonus') ];
        return [ eb, (1 + eb)*bonus, 1/effects.get('research_cost_bonus') ];
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
        'laying_bonus',
        'egg_value_bonus',
        'running_chicken_bonus',
        'away_earning_bonus',
        'research_cost_bonus',
    ]);

    function scoreFn(effects: EffectMap): number[] {
        const eb = SECount
                 * (baseSEBonus + effects.get('soul_egg_bonus'))
                 * Math.pow(basePEBonus + effects.get('prophecy_egg_bonus'), PECount);

        const bonus = effects.get('egg_value_bonus') * effects.get('laying_bonus')
                    * (online ? baseRCBonus + effects.get('running_chicken_bonus') : effects.get('away_earning_bonus'))
                    / (countCube ? effects.get('research_cost_bonus') : 1);

        return [ (1 + eb)*bonus, 1/effects.get('research_cost_bonus') ];
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
        'laying_bonus',
        'egg_value_bonus',
        'running_chicken_bonus',
        'away_earning_bonus',
        'research_cost_bonus',
    ]);

    function scoreFn(effects: EffectMap): number[] {
        const bonus = effects.get('egg_value_bonus') * effects.get('laying_bonus')
                    * (online ? baseRCBonus + effects.get('running_chicken_bonus') : effects.get('away_earning_bonus'))
                    / (countCube ? effects.get('research_cost_bonus') : 1);

        return [ bonus, 1/effects.get('research_cost_bonus') ];
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
        const bonus = getEffects(item, false)?.get('research_cost_bonus');
        return bonus < best[1] ? [item, bonus] : best;
    }, [null, 1]);
}



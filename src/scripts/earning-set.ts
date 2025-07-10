import * as T from '@/scripts/types.ts';
import { isclose } from '@/scripts/utils.ts';
import { getEffects } from '@/scripts/artifacts.ts';
import { prepareItems, searchSet } from '@/scripts/solvers.ts';
import { Effects } from '@/scripts/effects.ts';


export function searchEBSet(items: T.Item[],
                            maxSlot: number,
                            userEffects: Effects,
                            includedFamilies: T.ArtifactFamily[],
                            countCube: boolean,
                            countMonocle: boolean,
                            online: boolean,
                            reslotting: 0|1|2|3,
                            allowedGusset: T.AllowedGusset
                           ): T.ArtifactSet | null {

    const filteredItems = allowedGusset === T.AllowedGusset.ANY ? items : items.filter(x => {
        if (x.category !== T.ItemCategory.ARTIFACT) return true;
        if (x.family !== T.ArtifactFamily.GUSSET) return true;
        return allowedGusset === `artifact-gusset-${x.tier}-${x.rarity}`;
    });

    const { artifacts, stones } = prepareItems(filteredItems, (reslotting & 2) === 2, (reslotting & 1) === 1, [
        'soul_eggs',
        'prophecy_eggs',
        'soul_egg_bonus',
        'prophecy_egg_bonus',
        // needed for include requirements:
        'hab_capacity_mult',
        'team_laying_bonus',
        'team_earning_bonus',
    ], [
        'laying_rate',
        'egg_value_base',
        'egg_value_mult',
        'earning_mult',
        'earning_away_mult',
        'earning_mrcb_mult',
        'research_cost_mult',
        'team_earning_bonus',
    ]);

    function scoreFn(effects: Effects): number[] {
        const eb = effects.eb;

        const bonus = effects.laying_rate
                    * effects.egg_value
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

    // Restrict to the highest deflector and ship bonus
    const deflectors = (artifacts.get(T.ArtifactFamily.TACHYON_DEFLECTOR) ?? []);
    const bestLayingBonus = deflectors.reduce((tot,cur) => Math.max(tot, cur.effects.team_laying_bonus), 0);
    const bestDeflectors = deflectors.filter(x => isclose(x.effects.team_laying_bonus, bestLayingBonus));
    artifacts.set(T.ArtifactFamily.TACHYON_DEFLECTOR, bestDeflectors);

    const ships = (artifacts.get(T.ArtifactFamily.SHIP_IN_A_BOTTLE) ?? []);
    const bestEarningBonus = ships.reduce((tot,cur) => Math.max(tot, cur.effects.team_earning_bonus), 0);
    const bestShips = ships.filter(x => isclose(x.effects.team_earning_bonus, bestEarningBonus));
    artifacts.set(T.ArtifactFamily.SHIP_IN_A_BOTTLE, bestShips);

    const requiredFamilies: T.ArtifactFamily[] = [...includedFamilies];
    if (allowedGusset !== T.AllowedGusset.ANY && allowedGusset !== T.AllowedGusset.NONE) {
        requiredFamilies.push(T.ArtifactFamily.GUSSET);
    }

    return searchSet(artifacts, stones, maxSlot, scoreFn, {
        requiredFamilies,
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
                                 includedFamilies: T.ArtifactFamily[],
                                 countCube: boolean,
                                 countMonocle: boolean,
                                 online: boolean,
                                 reslotting: 0|1|2|3,
                                 allowedGusset: T.AllowedGusset
                                ): T.ArtifactSet | null {
    const filteredItems = allowedGusset === T.AllowedGusset.ANY ? items : items.filter(x => {
        if (x.category !== T.ItemCategory.ARTIFACT) return true;
        if (x.family !== T.ArtifactFamily.GUSSET) return true;
        return allowedGusset === `artifact-gusset-${x.tier}-${x.rarity}`;
    });

    const { artifacts, stones } = prepareItems(filteredItems, (reslotting & 2) === 2, (reslotting & 1) === 1, [
        'laying_rate',
        'egg_value_base',
        'egg_value_mult',
        'earning_mult',
        'earning_away_mult',
        'earning_mrcb_mult',
        'soul_eggs',
        'prophecy_eggs',
        'soul_egg_bonus',
        'prophecy_egg_bonus',
        'research_cost_mult',
        // needed for include requirements:
        'hab_capacity_mult',
        'team_laying_bonus',
        'team_earning_bonus',
    ], [
        'team_earning_bonus',
    ]);

    function scoreFn(effects: Effects): number[] {
        const eb = effects.eb;

        const bonus = effects.laying_rate
                    * effects.egg_value
                    * effects.earning_mult
                    * (online ? effects.earning_mrcb_mult : effects.earning_away_mult)
                    / (countCube ? effects.research_cost_mult : 1);

        return [
            (1 + eb)*bonus,
            effects.team_earning_bonus,
            1/effects.research_cost_mult,
        ];
    }

    // Restrict to the highest deflector and ship bonus
    const deflectors = (artifacts.get(T.ArtifactFamily.TACHYON_DEFLECTOR) ?? []);
    const bestLayingBonus = deflectors.reduce((tot,cur) => Math.max(tot, cur.effects.team_laying_bonus), 0);
    const bestDeflectors = deflectors.filter(x => isclose(x.effects.team_laying_bonus, bestLayingBonus));
    artifacts.set(T.ArtifactFamily.TACHYON_DEFLECTOR, bestDeflectors);

    const ships = (artifacts.get(T.ArtifactFamily.SHIP_IN_A_BOTTLE) ?? []);
    const bestEarningBonus = ships.reduce((tot,cur) => Math.max(tot, cur.effects.team_earning_bonus), 0);
    const bestShips = ships.filter(x => isclose(x.effects.team_earning_bonus, bestEarningBonus));
    artifacts.set(T.ArtifactFamily.SHIP_IN_A_BOTTLE, bestShips);

    const requiredFamilies: T.ArtifactFamily[] = [...includedFamilies];
    if (allowedGusset !== T.AllowedGusset.ANY && allowedGusset !== T.AllowedGusset.NONE) {
        requiredFamilies.push(T.ArtifactFamily.GUSSET);
    }

    return searchSet(artifacts, stones, maxSlot, scoreFn, {
        requiredFamilies,
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
                                includedFamilies: T.ArtifactFamily[],
                                countCube: boolean,
                                countMonocle: boolean,
                                online: boolean,
                                reslotting: 0|1|2|3,
                                allowedGusset: T.AllowedGusset
                               ): T.ArtifactSet | null {
    const filteredItems = allowedGusset === T.AllowedGusset.ANY ? items : items.filter(x => {
        if (x.category !== T.ItemCategory.ARTIFACT) return true;
        if (x.family !== T.ArtifactFamily.GUSSET) return true;
        return allowedGusset === `artifact-gusset-${x.tier}-${x.rarity}`;
    });

    const { artifacts, stones } = prepareItems(filteredItems, (reslotting & 2) === 2, (reslotting & 1) === 1, [
        'laying_rate',
        'egg_value_base',
        'egg_value_mult',
        'earning_mult',
        'earning_away_mult',
        'earning_mrcb_mult',
        'research_cost_mult',
        // needed for include requirements:
        'hab_capacity_mult',
        'team_laying_bonus',
        'team_earning_bonus',
    ]);

    function scoreFn(effects: Effects): number[] {
        const bonus = effects.laying_rate
                    * effects.egg_value
                    * effects.earning_mult
                    * (online ? effects.earning_mrcb_mult : effects.earning_away_mult)
                    / (countCube ? effects.research_cost_mult : 1);

        return [ bonus, 1/effects.research_cost_mult ];
    }

    // Restrict to the highest deflector and ship bonus
    const deflectors = (artifacts.get(T.ArtifactFamily.TACHYON_DEFLECTOR) ?? []);
    const bestLayingBonus = deflectors.reduce((tot,cur) => Math.max(tot, cur.effects.team_laying_bonus), 0);
    const bestDeflectors = deflectors.filter(x => isclose(x.effects.team_laying_bonus, bestLayingBonus));
    artifacts.set(T.ArtifactFamily.TACHYON_DEFLECTOR, bestDeflectors);

    const ships = (artifacts.get(T.ArtifactFamily.SHIP_IN_A_BOTTLE) ?? []);
    const bestEarningBonus = ships.reduce((tot,cur) => Math.max(tot, cur.effects.team_earning_bonus), 0);
    const bestShips = ships.filter(x => isclose(x.effects.team_earning_bonus, bestEarningBonus));
    artifacts.set(T.ArtifactFamily.SHIP_IN_A_BOTTLE, bestShips);

    const requiredFamilies: T.ArtifactFamily[] = [...includedFamilies];
    if (allowedGusset !== T.AllowedGusset.ANY && allowedGusset !== T.AllowedGusset.NONE) {
        requiredFamilies.push(T.ArtifactFamily.GUSSET);
    }

    return searchSet(artifacts, stones, maxSlot, scoreFn, {
        requiredFamilies,
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



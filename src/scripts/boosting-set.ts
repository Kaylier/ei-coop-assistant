import * as T from '@/scripts/types.ts';
import { isclose } from '@/scripts/utils.ts';
import { EffectMap } from '@/scripts/artifacts.ts';
import { prepareItems, searchSet } from '@/scripts/solvers.ts';



export function searchDiliSet(items: T.Item[],
                              maxSlot: number,
                              includeDeflector: boolean,
                              includeShip: boolean,
                              reslotting: boolean
                             ): T.ArtifactSet | null {
    const { artifacts, stones } = prepareItems(items, reslotting, reslotting, [
        'boost_duration_bonus',
        'internal_hatchery_bonus',
        'boost_bonus',
    ]);

    const requiredFamilies: T.ArtifactFamily[] = [];
    if (includeDeflector) requiredFamilies.push(T.ArtifactFamily.TACHYON_DEFLECTOR);
    if (includeShip)      requiredFamilies.push(T.ArtifactFamily.SHIP_IN_A_BOTTLE);

    const optionalFamilies: T.ArtifactFamily[] = [...artifacts.keys()].filter(x => !requiredFamilies.includes(x));

    function scoreFn(effects: EffectMap): number[] {
        return [
            effects.get('boost_duration_bonus'),
            effects.get('internal_hatchery_bonus')*effects.get('boost_bonus'),
        ];
    }

    return searchSet(artifacts, stones, maxSlot, scoreFn, {
        requiredFamilies,
        optionalFamilies,
    });
}


export function searchIHRSet(items: T.Item[],
                             maxSlot: number,
                             includeDeflector: boolean,
                             includeShip: boolean,
                             reslotting: boolean
                            ): T.ArtifactSet | null {
    const { artifacts, stones } = prepareItems(items, reslotting, reslotting, [
        'team_laying_bonus',
        'team_earning_bonus',
        'internal_hatchery_bonus',
        'laying_bonus',
        'boost_bonus',
        'hab_capacity_bonus',
    ]);

    // No restriction on deflector/ship, prefer the one that maximizes IHR
    // ie T3R with life stone will be prefered over T4C

    const requiredFamilies: T.ArtifactFamily[] = [];
    if (includeDeflector) requiredFamilies.push(T.ArtifactFamily.TACHYON_DEFLECTOR);
    if (includeShip)      requiredFamilies.push(T.ArtifactFamily.SHIP_IN_A_BOTTLE);

    const optionalFamilies: T.ArtifactFamily[] = [...artifacts.keys()].filter(x => !requiredFamilies.includes(x));

    function scoreFn(effects: EffectMap): number[] {
        //return [effects.get('internal_hatchery_bonus')*effects.get('boost_bonus')];
        return [
            effects.get('internal_hatchery_bonus')*effects.get('boost_bonus'),
            effects.get('hab_capacity_bonus'),
            effects.get('laying_bonus'),
        ];
    }

    return searchSet(artifacts, stones, maxSlot, scoreFn, {
        requiredFamilies,
        optionalFamilies,
    });
}


export function searchSlowIHRSet(items: T.Item[],
                                 maxSlot: number,
                                 includeDeflector: boolean,
                                 includeShip: boolean,
                                 reslotting: boolean
                                ): T.ArtifactSet | null {
    const { artifacts, stones } = prepareItems(items, reslotting, reslotting, [
        'team_laying_bonus',
        'team_earning_bonus',
        'internal_hatchery_bonus',
        'laying_bonus',
        'boost_bonus',
        'hab_capacity_bonus',
    ]);

    // Restrict to the highest deflector and ship bonus
    const deflectors = (artifacts.get(T.ArtifactFamily.TACHYON_DEFLECTOR) ?? []);
    const bestLayingBonus = deflectors.reduce((tot,cur) => Math.max(tot, cur.effects.get('team_laying_bonus')), 0);
    const bestDeflectors = deflectors.filter(x => isclose(x.effects.get('team_laying_bonus'), bestLayingBonus));
    artifacts.set(T.ArtifactFamily.TACHYON_DEFLECTOR, bestDeflectors);

    const ships = (artifacts.get(T.ArtifactFamily.SHIP_IN_A_BOTTLE) ?? []);
    const bestEarningBonus = ships.reduce((tot,cur) => Math.max(tot, cur.effects.get('team_earning_bonus')), 0);
    const bestShips = ships.filter(x => isclose(x.effects.get('team_earning_bonus'), bestEarningBonus));
    artifacts.set(T.ArtifactFamily.SHIP_IN_A_BOTTLE, bestShips);

    const requiredFamilies: T.ArtifactFamily[] = [];
    if (includeDeflector) requiredFamilies.push(T.ArtifactFamily.TACHYON_DEFLECTOR);
    if (includeShip)      requiredFamilies.push(T.ArtifactFamily.SHIP_IN_A_BOTTLE);

    const optionalFamilies: T.ArtifactFamily[] = [...artifacts.keys()].filter(x => !requiredFamilies.includes(x));

    function scoreFn(effects: EffectMap): number[] {
        return [
            effects.get('internal_hatchery_bonus')*effects.get('laying_bonus')*effects.get('boost_bonus'),
            effects.get('internal_hatchery_bonus')*effects.get('boost_bonus'),
            effects.get('hab_capacity_bonus'),
        ];
    }

    return searchSet(artifacts, stones, maxSlot, scoreFn, {
        requiredFamilies,
        optionalFamilies,
    });
}



import * as T from '@/scripts/types.ts';
import { EffectMap } from '@/scripts/artifacts.ts';
import { prepareItems, searchSet } from '@/scripts/solvers.ts';
import type { ArtifactSet } from '@/scripts/solvers.ts';



export function searchDiliSet(items: T.Item[],
                              maxSlot: number,
                              includeDeflector: boolean,
                              includeShip: boolean,
                              reslotting: boolean
                             ): ArtifactSet | null {
    const { artifacts, stones } = prepareItems(items, reslotting, reslotting, [
        'boost_duration_bonus',
        'internal_hatchery_bonus',
        'laying_bonus',
        'boost_bonus',
    ]);

    const requiredFamilies: T.ArtifactFamily[] = [];
    if (includeDeflector) requiredFamilies.push(T.ArtifactFamily.TACHYON_DEFLECTOR);
    if (includeShip)      requiredFamilies.push(T.ArtifactFamily.SHIP_IN_A_BOTTLE);

    const optionalFamilies: T.ArtifactFamily[] = [...artifacts.keys()].filter(x => !requiredFamilies.includes(x));

    const stoneFamilies: T.StoneFamily[] = [T.StoneFamily.DILITHIUM_STONE];

    function scoreFn(effects: EffectMap): number[] {
        return [effects.get('boost_duration_bonus')];
    }

    return searchSet(artifacts, stones, maxSlot, scoreFn, {
        requiredFamilies,
        optionalFamilies,
        stoneFamilies,
    });
}


export function searchIHRSet(items: T.Item[],
                             maxSlot: number,
                             includeDeflector: boolean,
                             includeShip: boolean,
                             reslotting: boolean
                            ): ArtifactSet | null {
    const { artifacts, stones } = prepareItems(items, reslotting, reslotting, [
        'team_laying_bonus',
        'team_earning_bonus',
        'internal_hatchery_bonus',
        'laying_bonus',
        'boost_bonus',
    ]);

    // No restriction on deflector/ship, favourise the one that maximizes IHR
    // ie T3R with life stone will be prefered over T4C

    const requiredFamilies: T.ArtifactFamily[] = [];
    if (includeDeflector) requiredFamilies.push(T.ArtifactFamily.TACHYON_DEFLECTOR);
    if (includeShip)      requiredFamilies.push(T.ArtifactFamily.SHIP_IN_A_BOTTLE);

    const optionalFamilies: T.ArtifactFamily[] = [...artifacts.keys()].filter(x => !requiredFamilies.includes(x));

    const stoneFamilies: T.StoneFamily[] = [
        T.StoneFamily.LIFE_STONE,
        T.StoneFamily.TACHYON_STONE
    ];

    function scoreFn(effects: EffectMap): number[] {
        //return [effects.get('internal_hatchery_bonus')*effects.get('boost_bonus')];
        return [effects.get('internal_hatchery_bonus')*effects.get('boost_bonus'), effects.get('laying_bonus')];
    }

    return searchSet(artifacts, stones, maxSlot, scoreFn, {
        requiredFamilies,
        optionalFamilies,
        stoneFamilies,
    });
}


export function searchSlowIHRSet(items: T.Item[],
                                 maxSlot: number,
                                 includeDeflector: boolean,
                                 includeShip: boolean,
                                 reslotting: boolean
                                ): ArtifactSet | null {
    const { artifacts, stones } = prepareItems(items, reslotting, reslotting, [
        'team_laying_bonus',
        'team_earning_bonus',
        'internal_hatchery_bonus',
        'laying_bonus',
        'boost_bonus',
    ]);

    // Uses the highest deflector/ship bonus
    const deflectors = (artifacts.get(T.ArtifactFamily.TACHYON_DEFLECTOR) ?? []);
    deflectors.sort((a,b) => b.effects.get('team_laying_bonus') - a.effects.get('team_laying_bonus'));
    artifacts.set(T.ArtifactFamily.TACHYON_DEFLECTOR, deflectors.slice(0,1));

    const ships = (artifacts.get(T.ArtifactFamily.SHIP_IN_A_BOTTLE) ?? []);
    ships.sort((a,b) => b.effects.get('team_earning_bonus') - a.effects.get('team_earning_bonus'));
    artifacts.set(T.ArtifactFamily.SHIP_IN_A_BOTTLE, ships.slice(0,1));

    const requiredFamilies: T.ArtifactFamily[] = [];
    if (includeDeflector) requiredFamilies.push(T.ArtifactFamily.TACHYON_DEFLECTOR);
    if (includeShip)      requiredFamilies.push(T.ArtifactFamily.SHIP_IN_A_BOTTLE);

    const optionalFamilies: T.ArtifactFamily[] = [...artifacts.keys()].filter(x => !requiredFamilies.includes(x));

    const stoneFamilies: T.StoneFamily[] = [T.StoneFamily.LIFE_STONE, T.StoneFamily.TACHYON_STONE];

    function scoreFn(effects: EffectMap): number[] {
        return [effects.get('internal_hatchery_bonus')*effects.get('laying_bonus')*effects.get('boost_bonus')];
    }

    return searchSet(artifacts, stones, maxSlot, scoreFn, {
        requiredFamilies,
        optionalFamilies,
        stoneFamilies,
    });
}



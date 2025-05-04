import * as T from '@/scripts/types.ts';
import { isclose } from '@/scripts/utils.ts';
import { prepareItems, searchSet } from '@/scripts/solvers.ts';
import { Effects } from '@/scripts/effects.ts';



export function searchDiliSet(items: T.Item[],
                              maxSlot: number,
                              userEffects: Effects,
                              includeDeflector: boolean,
                              includeShip: boolean,
                              reslotting: boolean,
                              allowedGusset: T.AllowedGusset
                             ): T.ArtifactSet | null {
    const filteredItems = allowedGusset === T.AllowedGusset.ANY ? items : items.filter(x => {
        if (x.category !== T.ItemCategory.ARTIFACT) return true;
        if (x.family !== T.ArtifactFamily.GUSSET) return true;
        return allowedGusset === `artifact-gusset-${x.tier}-${x.rarity}`;
    });

    const { artifacts, stones } = prepareItems(filteredItems, reslotting, reslotting, [
        'boost_duration_mult',
        'ihr_mult',
        'boost_mult',
    ]);

    const requiredFamilies: T.ArtifactFamily[] = [];
    if (includeDeflector) requiredFamilies.push(T.ArtifactFamily.TACHYON_DEFLECTOR);
    if (includeShip)      requiredFamilies.push(T.ArtifactFamily.SHIP_IN_A_BOTTLE);
    if (allowedGusset !== T.AllowedGusset.ANY && allowedGusset !== T.AllowedGusset.NONE) {
        requiredFamilies.push(T.ArtifactFamily.GUSSET);
    }

    const optionalFamilies: T.ArtifactFamily[] = [...artifacts.keys()]
        .filter(x => !requiredFamilies.includes(x)
                  && (allowedGusset !== T.AllowedGusset.NONE || x !== T.ArtifactFamily.GUSSET));

    function scoreFn(effects: Effects): number[] {
        return [
            effects.boost_duration_mult,
            effects.ihr_mult*effects.boost_mult,
        ];
    }

    return searchSet(artifacts, stones, maxSlot, scoreFn, {
        requiredFamilies,
        optionalFamilies,
        userEffects,
    });
}


export function searchIHRSets(items: T.Item[],
                              maxSlot: number,
                              userEffects: Effects,
                              includeDeflector: boolean,
                              relaxDeflector: boolean, // relax the deflector contraint for 2nd to last sets
                              includeShip: boolean,
                              relaxShip: boolean,
                              reslotting: boolean,
                              targetGusset: T.AllowedGusset
                             ): T.ArtifactSet[] {
    const filteredItems = targetGusset === T.AllowedGusset.ANY ? items : items.filter(x => {
        if (x.category !== T.ItemCategory.ARTIFACT) return true;
        if (x.family !== T.ArtifactFamily.GUSSET) return true;
        return `artifact-gusset-${x.tier}-${x.rarity}` <= targetGusset;
    });

    const { artifacts, stones } = prepareItems(filteredItems, reslotting, reslotting, [
        'team_laying_bonus', 'team_earning_bonus', // needed for include requirements
        'ihr_mult',
        'laying_rate',
        'boost_mult',
        'hab_capacity_mult',
    ]);

    function scoreFn(effects: Effects): number[] {
        //return [effects.ihr_mult*effects.boost_mult];
        return [
            effects.ihr_mult*effects.boost_mult,
            effects.hab_capacity_mult,
            effects.laying_rate,
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


    let requiredFamilies: T.ArtifactFamily[] = [];
    if (includeDeflector) requiredFamilies.push(T.ArtifactFamily.TACHYON_DEFLECTOR);
    if (includeShip)      requiredFamilies.push(T.ArtifactFamily.SHIP_IN_A_BOTTLE);

    const ret = [];
    let set = searchSet(artifacts, stones, maxSlot, scoreFn, {
        requiredFamilies,
        optionalFamilies: [...artifacts.keys()].filter(x => !requiredFamilies.includes(x)),
        userEffects,
    });

    if (relaxDeflector) {
        requiredFamilies = requiredFamilies.filter(x => x !== T.ArtifactFamily.TACHYON_DEFLECTOR);
    }
    if (relaxShip) {
        requiredFamilies = requiredFamilies.filter(x => x !== T.ArtifactFamily.SHIP_IN_A_BOTTLE);
    }
    if (targetGusset !== T.AllowedGusset.ANY && targetGusset !== T.AllowedGusset.NONE) {
        requiredFamilies.push(T.ArtifactFamily.GUSSET);
    }
    const optionalFamilies: T.ArtifactFamily[] = [...artifacts.keys()].filter(x => !requiredFamilies.includes(x));

    while (set !== null) {
        ret.push(set);

        const lastGussetItem = set.set.filter(x => x && x.family === T.ArtifactFamily.GUSSET).at(0);
        const lastGusset = `artifact-gusset-${lastGussetItem?.tier ?? 0}-${lastGussetItem?.rarity ?? 0}`;

        // Found the set for target gusset, returns
        if (lastGusset === targetGusset || targetGusset === T.AllowedGusset.ANY) return ret;

        const gussets = artifacts.get(T.ArtifactFamily.GUSSET)?.filter(x => {
            return lastGusset < `artifact-gusset-${x.artifacts[0].tier}-${x.artifacts[0].rarity}`;
        }) ?? null;
        if (gussets) {
            artifacts.set(T.ArtifactFamily.GUSSET, gussets);
        }

        set = searchSet(artifacts, stones, maxSlot, scoreFn, {
            requiredFamilies,
            optionalFamilies,
            userEffects,
        });
    }
    // Couldn't solve for the target gusset, abort
    return [];
}


export function searchSlowIHRSet(items: T.Item[],
                                 maxSlot: number,
                                 userEffects: Effects,
                                 includeDeflector: boolean,
                                 includeShip: boolean,
                                 reslotting: boolean,
                                 allowedGusset: T.AllowedGusset
                                ): T.ArtifactSet | null {
    const filteredItems = allowedGusset === T.AllowedGusset.ANY ? items : items.filter(x => {
        if (x.category !== T.ItemCategory.ARTIFACT) return true;
        if (x.family !== T.ArtifactFamily.GUSSET) return true;
        return allowedGusset === `artifact-gusset-${x.tier}-${x.rarity}`;
    });

    const { artifacts, stones } = prepareItems(filteredItems, reslotting, reslotting, [
        'team_laying_bonus', 'team_earning_bonus', // needed for include requirements
        'ihr_mult',
        'laying_rate',
        'boost_mult',
        'hab_capacity_mult',
    ]);

    // Restrict to the highest deflector and ship bonus
    const deflectors = (artifacts.get(T.ArtifactFamily.TACHYON_DEFLECTOR) ?? []);
    const bestLayingBonus = deflectors.reduce((tot,cur) => Math.max(tot, cur.effects.team_laying_bonus), 0);
    const bestDeflectors = deflectors.filter(x => isclose(x.effects.team_laying_bonus, bestLayingBonus));
    artifacts.set(T.ArtifactFamily.TACHYON_DEFLECTOR, bestDeflectors);

    const ships = (artifacts.get(T.ArtifactFamily.SHIP_IN_A_BOTTLE) ?? []);
    const bestEarningBonus = ships.reduce((tot,cur) => Math.max(tot, cur.effects.team_earning_bonus), 0);
    const bestShips = ships.filter(x => isclose(x.effects.team_earning_bonus, bestEarningBonus));
    artifacts.set(T.ArtifactFamily.SHIP_IN_A_BOTTLE, bestShips);

    const requiredFamilies: T.ArtifactFamily[] = [];
    if (includeDeflector) requiredFamilies.push(T.ArtifactFamily.TACHYON_DEFLECTOR);
    if (includeShip)      requiredFamilies.push(T.ArtifactFamily.SHIP_IN_A_BOTTLE);
    if (allowedGusset !== T.AllowedGusset.ANY && allowedGusset !== T.AllowedGusset.NONE) {
        requiredFamilies.push(T.ArtifactFamily.GUSSET);
    }

    const optionalFamilies: T.ArtifactFamily[] = [...artifacts.keys()].filter(x => !requiredFamilies.includes(x));

    function scoreFn(effects: Effects): number[] {
        return [
            effects.ihr_mult*effects.laying_rate*effects.boost_mult,
            effects.ihr_mult*effects.boost_mult,
            effects.hab_capacity_mult,
        ];
    }

    return searchSet(artifacts, stones, maxSlot, scoreFn, {
        requiredFamilies,
        optionalFamilies,
        userEffects,
    });
}


export const boostSets = new Map<string, {
    boosts: { id: T.Boost, amount?: number, streamlined?: number }[],
    default?: boolean,
    freePermit?: boolean,
    proPermit?: boolean,
}>([
    // 10-minute boosts
    ["tach_1000x10+boost_2x30", {
        freePermit: true, proPermit: true,
        boosts: [{ id: T.Boost.TACHYON_1000X10 }, { id: T.Boost.BOOST_2X30}],
    }],
    ["tach_1000x10+boost_2x30x2", {
        default: true,
        proPermit: true,
        boosts: [{ id: T.Boost.TACHYON_1000X10 }, { id: T.Boost.BOOST_2X30, amount: 2 }],
    }],
    ["tach_1000x10+boost_2x30x3", {
        proPermit: true,
        boosts: [{ id: T.Boost.TACHYON_1000X10 }, { id: T.Boost.BOOST_2X30, amount: 3 }],
    }],
    ["tach_1000x10+boost_2x30x4", {
        proPermit: true,
        boosts: [{ id: T.Boost.TACHYON_1000X10 }, { id: T.Boost.BOOST_2X30, amount: 4 }],
    }],
    ["tach_1000x10+boost_10x10", {
        default: true,
        freePermit: true, proPermit: true,
        boosts: [{ id: T.Boost.TACHYON_1000X10 }, { id: T.Boost.BOOST_10X10 }],
    }],
    // 1-hour boosts
    ["tach_1000x60", {
        default: true,
        freePermit: true, proPermit: true,
        boosts: [{ id: T.Boost.TACHYON_1000X60 }],
    }],
    ["tach_1000x60+boost_2x30", {
        default: true,
        freePermit: true, proPermit: true,
        boosts: [{ id: T.Boost.TACHYON_1000X60 }, { id: T.Boost.BOOST_2X30 }],
    }],
    ["tach_1000x60+boost_2x30x2", {
        default: true,
        proPermit: true,
        boosts: [{ id: T.Boost.TACHYON_1000X60 }, { id: T.Boost.BOOST_2X30, amount: 2 }],
    }],
    ["tach_1000x60+boost_2x30*2", {
        default: true,
        freePermit: true,
        boosts: [{ id: T.Boost.TACHYON_1000X60 }, { id: T.Boost.BOOST_2X30, streamlined: 2 }],
    }],
    // 2-hour boosts
    ["tach_100x120", {
        freePermit: true, proPermit: true,
        boosts: [{ id: T.Boost.TACHYON_100X120 }],
    }],
    ["tach_100x120+boost_2x30", {
        freePermit: true, proPermit: true,
        boosts: [{ id: T.Boost.TACHYON_100X120 }, { id: T.Boost.BOOST_2X30 }],
    }],
    ["tach_100x120+boost_2x30x2", {
        proPermit: true,
        boosts: [{ id: T.Boost.TACHYON_100X120 }, { id: T.Boost.BOOST_2X30, amount: 2 }],
    }],
    ["tach_100x120+boost_2x30*2", {
        freePermit: true,
        boosts: [{ id: T.Boost.TACHYON_100X120 }, { id: T.Boost.BOOST_2X30, streamlined: 2 }],
    }],
    ["tach_100x120+boost_2x30x3", {
        default: true,
        proPermit: true,
        boosts: [{ id: T.Boost.TACHYON_100X120 }, { id: T.Boost.BOOST_2X30, amount: 3 }],
    }],
    ["tach_100x120+boost_2x30*3", {
        default: true,
        freePermit: true,
        boosts: [{ id: T.Boost.TACHYON_100X120 }, { id: T.Boost.BOOST_2X30, streamlined: 3 }],
    }],
    ["tach_100x120+boost_2x30x4", {
        proPermit: true,
        boosts: [{ id: T.Boost.TACHYON_100X120 }, { id: T.Boost.BOOST_2X30, amount: 4 }],
    }],
    ["tach_100x120+boost_2x30*4", {
        freePermit: true,
        boosts: [{ id: T.Boost.TACHYON_100X120 }, { id: T.Boost.BOOST_2X30, streamlined: 4 }],
    }],
    ["tach_100x120+boost_5x60", {
        freePermit: true, proPermit: true,
        boosts: [{ id: T.Boost.TACHYON_100X120 }, { id: T.Boost.BOOST_5X60 }],
    }],

    ["tach_100x120x2", {
        default: true,
        freePermit: true, proPermit: true,
        boosts: [{ id: T.Boost.TACHYON_100X120, amount: 2 }],
    }],
    ["tach_100x120x2+boost_2x30", {
        proPermit: true,
        boosts: [{ id: T.Boost.TACHYON_100X120, amount: 2 }, { id: T.Boost.BOOST_2X30 }],
    }],
    ["tach_100x120x2+boost_2x30x2", {
        proPermit: true,
        boosts: [{ id: T.Boost.TACHYON_100X120, amount: 2 }, { id: T.Boost.BOOST_2X30, amount: 2 }],
    }],
    ["tach_100x120x2+boost_2x30x3", {
        proPermit: true,
        boosts: [{ id: T.Boost.TACHYON_100X120, amount: 2 }, { id: T.Boost.BOOST_2X30, amount: 3 }],
    }],
    ["tach_100x120x2+boost_5x60", {
        proPermit: true,
        boosts: [{ id: T.Boost.TACHYON_100X120, amount: 2 }, { id: T.Boost.BOOST_5X60 }],
    }],

    // Expensive boosts
    ["tach_1000x60x3+boost_50x10x2", {
        proPermit: true,
        boosts: [{ id: T.Boost.TACHYON_1000X60, amount: 3 }, { id: T.Boost.BOOST_50X10, amount: 2 }],
    }],
    ["tach_1000x60+boost_50x10*6", {
        freePermit: true,
        boosts: [{ id: T.Boost.TACHYON_1000X60 }, { id: T.Boost.BOOST_50X10, streamlined: 6 }],
    }],
]);


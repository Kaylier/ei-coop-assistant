/*
 * This file contains helpers for getting information related to boosts
 */
import * as T from "@/scripts/types.ts";


enum BoostType {
    BULB,
    EARNING,
    TACHYON,
    BOOST,
    SOUL,
    CASH,
    MIRROR,
};

const boostMetadata: {
    [key in T.Boost]: {
        type: BoostType,
        value: number,
        duration: number,
        tokens: number,
        ge: number,
        text: string,
    }} = {
    [T.Boost.BULB_QUANTUM   ]:
        { type: BoostType.BULB   , value:    0, duration:  10, tokens: 0, ge:    10, text: "unlimited for 10min" },
    [T.Boost.BULB_DILI      ]:
        { type: BoostType.BULB   , value:    0, duration:  10, tokens: 0, ge:  1000, text: "automatic for 10min" },

    [T.Boost.EARNING_3X20   ]:
        { type: BoostType.EARNING, value:    3, duration:  20, tokens: 0, ge:    50, text: "3× for 20min" },
    [T.Boost.EARNING_10X15  ]:
        { type: BoostType.EARNING, value:   10, duration:  15, tokens: 1, ge:   150, text: "10× for 15min" },
    [T.Boost.EARNING_10X180 ]:
        { type: BoostType.EARNING, value:   10, duration: 180, tokens: 1, ge:   750, text: "10× for 3hr" },
    [T.Boost.EARNING_50X10  ]:
        { type: BoostType.EARNING, value:   50, duration:  10, tokens: 2, ge:  2500, text: "50× for 10min" },
    [T.Boost.EARNING_50X120 ]:
        { type: BoostType.EARNING, value:   50, duration: 120, tokens: 3, ge:  7500, text: "50× for 2hr" },

    [T.Boost.TACHYON_10X10  ]:
        { type: BoostType.TACHYON, value:   10, duration:  10, tokens: 0, ge:    50, text: "10× for 10min" },
    [T.Boost.TACHYON_10X240 ]:
        { type: BoostType.TACHYON, value:   10, duration: 240, tokens: 0, ge:   500, text: "10× for 4hr" },
    [T.Boost.TACHYON_100X10 ]:
        { type: BoostType.TACHYON, value:  100, duration:  10, tokens: 2, ge:  1000, text: "100× for 10min" },
    [T.Boost.TACHYON_100X120]:
        { type: BoostType.TACHYON, value:  100, duration: 120, tokens: 2, ge:  5000, text: "100× for 2hr" },
    [T.Boost.TACHYON_1000X10]:
        { type: BoostType.TACHYON, value: 1000, duration:  10, tokens: 4, ge: 12000, text: "1000× for 10min" },
    [T.Boost.TACHYON_1000X60]:
        { type: BoostType.TACHYON, value: 1000, duration:  60, tokens: 4, ge: 25000, text: "1000× for 1hr" },

    [T.Boost.BOOST_2X30     ]:
        { type: BoostType.BOOST  , value:    2, duration:  30, tokens: 1, ge:  1000, text: "2× for 30min" },
    [T.Boost.BOOST_10X10    ]:
        { type: BoostType.BOOST  , value:   10, duration:  10, tokens: 4, ge:  8000, text: "10× for 10min" },
    [T.Boost.BOOST_5X60     ]:
        { type: BoostType.BOOST  , value:    5, duration:  60, tokens: 3, ge: 15000, text: "5× for 1hr" },
    [T.Boost.BOOST_50X10    ]:
        { type: BoostType.BOOST  , value:   50, duration:  10, tokens: 8, ge: 50000, text: "50× for 10min" },

    [T.Boost.SOUL_5X30      ]:
        { type: BoostType.SOUL   , value:    5, duration:  30, tokens: 0, ge:   200, text: "5× for 30min" },
    [T.Boost.SOUL_50X20     ]:
        { type: BoostType.SOUL   , value:   50, duration:  20, tokens: 0, ge:  1000, text: "50× for 20min" },
    [T.Boost.SOUL_500X10    ]:
        { type: BoostType.SOUL   , value:  500, duration:  10, tokens: 0, ge: 10000, text: "500× for 10min" },

    [T.Boost.CASH_10        ]:
        { type: BoostType.CASH   , value:  0.1, duration:   0, tokens: 1, ge:   200, text: "10% farm value" },
    [T.Boost.CASH_100       ]:
        { type: BoostType.CASH   , value:  1.0, duration:   0, tokens: 1, ge:   750, text: "100% farm value" },
    [T.Boost.CASH_500       ]:
        { type: BoostType.CASH   , value:  5.0, duration:   0, tokens: 2, ge:  2500, text: "500% farm value" },

    [T.Boost.MIRROR_10      ]:
        { type: BoostType.MIRROR , value:    0, duration:  10, tokens: 1, ge:   100, text: "mirror for 10min" },
    [T.Boost.MIRROR_60      ]:
        { type: BoostType.MIRROR , value:    0, duration:  60, tokens: 2, ge:   500, text: "mirror for 1hr" },
    [T.Boost.MIRROR_1D      ]:
        { type: BoostType.MIRROR , value:    0, duration:1440, tokens: 3, ge:  2000, text: "mirror for 1d" },
} as const;

export function isTachyon(boost: T.Boost) {
    return boostMetadata[boost].type === BoostType.TACHYON;
}

export function isBoostBeacon(boost: T.Boost) {
    return boostMetadata[boost].type === BoostType.BOOST;
}

export function getDescription(boost: T.Boost) {
    return boostMetadata[boost].text ?? 'unknown boost';
}

export function getTokenCost(boost: T.Boost) {
    return boostMetadata[boost].tokens;
}

export function getGECost(boost: T.Boost) {
    return boostMetadata[boost].ge;
}

export function getMultiplier(boost: T.Boost) {
    return boostMetadata[boost].value;
}

export function getDuration(boost: T.Boost) {
    return boostMetadata[boost].duration;
}

export function getImg(boost: T.Boost) {
    return `/img/boosts/${boost}.png`;
}


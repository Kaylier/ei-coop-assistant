/*
 * This file contains helpers for getting information related to boosts
 */
import * as T from "@/scripts/types.ts";


enum BoostType {
    TACHYON,
    BOOST,
};

const boostMetadata = {
    [T.Boost.TACHYON_10X30  ]: {
        type: BoostType.TACHYON, value:   10, duration:  30, tokens: 1, ge:   200, text: "10× for 30min" },
    [T.Boost.TACHYON_10X10  ]: {
        type: BoostType.TACHYON, value:   10, duration:  10, tokens: 0, ge:    50, text: "10× for 10min" },
    [T.Boost.TACHYON_10X240 ]: {
        type: BoostType.TACHYON, value:   10, duration: 240, tokens: 0, ge:   500, text: "10× for 4hr" },
    [T.Boost.TACHYON_100X20 ]: {
        type: BoostType.TACHYON, value:  100, duration:  20, tokens: 3, ge:  1000, text: "100× for 20min" },
    [T.Boost.TACHYON_100X10 ]: {
        type: BoostType.TACHYON, value:  100, duration:  10, tokens: 2, ge:  1000, text: "100× for 10min" },
    [T.Boost.TACHYON_100X120]: {
        type: BoostType.TACHYON, value:  100, duration: 120, tokens: 2, ge:  5000, text: "100× for 2hr" },
    [T.Boost.TACHYON_1000X10]: {
        type: BoostType.TACHYON, value: 1000, duration:  10, tokens: 4, ge: 12000, text: "1000× for 10min" },
    [T.Boost.TACHYON_1000X60]: {
        type: BoostType.TACHYON, value: 1000, duration:  60, tokens: 4, ge: 25000, text: "1000× for 1hr" },
    [T.Boost.BOOST_2X30     ]: {
        type: BoostType.BOOST  , value:    2, duration:  30, tokens: 1, ge:  1000, text: "2× for 30min" },
    [T.Boost.BOOST_10X10    ]: {
        type: BoostType.BOOST  , value:   10, duration:  10, tokens: 4, ge:  8000, text: "10× for 10min" },
    [T.Boost.BOOST_5X60     ]: {
        type: BoostType.BOOST  , value:    5, duration:  60, tokens: 3, ge: 15000, text: "5× for 1hr" },
    [T.Boost.BOOST_50X10    ]: {
        type: BoostType.BOOST  , value:   50, duration:  10, tokens: 8, ge: 50000, text: "50× for 10min" },
};

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



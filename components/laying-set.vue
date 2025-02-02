<template>
    <load-eid :userData="userData" @onloaded="(x) => userData = x"></load-eid>
    <section class="settings">
        <div>
            <label>
                <input type="checkbox" id="include-deflector" v-model="includeDeflector" />
                Include best deflector for
                <div class="switch" :class="{ disabled: !includeDeflector }">
                    <label><input type="radio" name="deflector-mode" value="contribution" v-model="deflectorMode" />
                        contribution
                    </label>
                    <label><input type="radio" name="deflector-mode" value="teamwork" v-model="deflectorMode" />
                        teamwork
                    </label>
                </div>
            </label>
        </div>
        <a href='#' v-if="!extraOptions" @click="extraOptions = true;">
            show settings
        </a>
        <div v-if="extraOptions">
            <label tabindex="0" class="tooltip-icon">
                ⓘ
                <span class="tooltip-text">
                    Maximum laying rate with full habs<br/>
                    without any artifact equipped.
                </span>
            </label>
            <label for="base-laying-rate">
                Base laying rate
            </label>
            <input type="text" id="base-laying-rate"
                    :class="{ invalid: !checkRateString(baseLayingRateString) }"
                    v-model="baseLayingRateString"
                    :placeholder="formatRateString(userData?.baseLayingRate ?? defaultBaseLayingRate)">
            </input>
        </div>
        <div v-if="extraOptions">
            <label tabindex="0" class="tooltip-icon">
                ⓘ
                <span class="tooltip-text">
                    Maximum shipping rate<br/>
                    without any artifact equipped.
                </span>
            </label>
            <label for="base-shipping-rate">
                Base shipping rate
            </label>
            <input type="text" id="base-shipping-rate"
                    :class="{ invalid: !checkRateString(baseShippingRateString) }"
                    v-model="baseShippingRateString"
                    :placeholder="formatRateString(userData?.baseShippingRate ?? defaultBaseShippingRate)">
            </input>
        </div>
    </section>

    <pre v-if="errorMessage" class="invalid-text" style="white-space:preserve">{{ errorMessage }}</pre>

    <section class="main">
        <template v-for="entry in entries">
            <div v-if="!entry.hidden" class="threshold">
                <div class="threshold-label-frame" title="Deflector bonus (excluding yours)">
                    <div class="threshold-label">
                        <span v-if="entry.lowerThreshold >= 0">
                            + {{ entry.lowerThreshold.toLocaleString(undefined,{style: 'percent', minimumFractionDigits:0, roundingMode: 'ceil'}) }}
                        </span>
                        <img src="/img/icons/deflector-bonus.png"></img>
                    </div>
                </div>
                <span v-if="entry.lowerRate" class="threshold-rate">
                    <span class="threshold-rate-label">
                        laying rate
                    </span>
                    {{ formatRateString(entry.lowerRate) }}
                </span>
            </div>
            <div v-if="!entry.hidden" class="entry">
                <div class="axis"></div>
                <div class="optimal-label-frame" title="Optimal deflector bonus for this set">
                    <div tabindex="0" v-if="entry.optiThreshold >= 0" class="optimal-label">
                        <span>
                            + {{ entry.optiThreshold.toLocaleString(undefined,{style: 'percent', minimumFractionDigits:0, roundingMode: 'ceil'}) }}
                        </span>
                        <img src="/img/icons/deflector-bonus-alt.png"></img>
                    </div>
                </div>
                <inventory-view v-if="entry.artifactSet"
                    :artifacts="entry.artifactSet"
                    :isSet="true"
                    :deflectorBonus="entry.optiThreshold"
                    :proPermit="userData.proPermit"
                    :column=4 :row=1></inventory-view>
            </div>
        </template>
        <template v-if="entries.length">
            <div class="threshold">
                <div class="threshold-label-frame">
                    <div class="threshold-label">
                        <img src="/img/icons/deflector-bonus.png"></img>
                    </div>
                </div>
                <span v-if="entries.at(-1).higherRate" class="threshold-rate">
                    <span class="threshold-rate-label">
                        laying rate
                    </span>
                    {{ formatRateString(entries.at(-1).higherRate) }}
                </span>
            </div>
            <div class="entry">
                <div class="axis-end"></div>
            </div>
        </template>
        <img v-else-if="!userData" src="/examples/demo.png" class="demo-img" />
        <span v-else-if="!errorMessage" class="invalid-text">
            You don't have enough artifacts to build a laying set.
        </span>
    </section>
</template>

<style scoped src="/css/laying-set.css"></style>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { checkRateString, parseRateString, formatRateString, minmaxReduce, combinations, product } from '/scripts/utils.ts';
import * as T from '/scripts/types.ts';
import { getEffects } from '/scripts/artifacts.ts';


// Template variables declarations and default values
const includeDeflector = ref(true);
const deflectorMode = ref("contribution");
const extraOptions = ref(false);

const baseLayingRateString = ref("");
const baseLayingRate = ref(0);
// This default is only used when no user data is loaded, or when it failed to calculate the rate from user data
// I'm using the value for max ER and CR without colleggtibles
const defaultBaseLayingRate = 1047816000000;

const baseShippingRateString = ref("");
const baseShippingRate = ref(0);
// This default is only used when no user data is loaded, or when it failed to calculate the rate from user data
// I'm using the value for max ER and CR without colleggtibles
const defaultBaseShippingRate = 1985572814941.4062;

const userData = ref(null);
const entries = ref([]);
const entriesStart = ref(0);

const errorMessage = ref("");


Vue.onMounted(async () => {
    includeDeflector.value = JSON.parse(localStorage.getItem('include-deflector')) ??
                             includeDeflector.value;
    deflectorMode.value = JSON.parse(localStorage.getItem('deflector-mode')) ??
                          deflectorMode.value;
    baseLayingRateString.value = localStorage.getItem('base-laying-rate') ??
                                 baseLayingRateString.value;
    baseShippingRateString.value = localStorage.getItem('base-shipping-rate') ??
                                   baseShippingRateString.value;
});


watch(includeDeflector, () => {
    localStorage.setItem('include-deflector', JSON.stringify(includeDeflector.value));
});
watch(deflectorMode, () => {
    localStorage.setItem('deflector-mode', JSON.stringify(deflectorMode.value));
});
watch(userData, () => {
    if (!userData.value) return;
    localStorage.setItem('user-data', JSON.stringify(userData.value));

    // Update rates in case a new default value must be taken into account
    validateBaseLayingRate(baseLayingRateString.value, true);
    validateBaseShippingRate(baseShippingRateString.value, true);

    compute();
});
watch(includeDeflector, compute);
watch(deflectorMode, compute);
watch(baseLayingRateString, validateBaseLayingRate);
watch(baseShippingRateString, validateBaseShippingRate);
watch(baseLayingRate, updateScale);
watch(baseShippingRate, updateScale);

/*
 * Validate an input string as a rate and change the value of baseLayingRate accordingly.
 * If the input is invalid, the rate is unchanged, unless reset is set to true.
 * For an empty input, a default value is assigned
 */
function validateBaseLayingRate(s, reset=false) {
    if (checkRateString(s, false)) {
        localStorage.setItem('base-laying-rate', s);
        baseLayingRate.value = parseRateString(s);
    } else if (!s) {
        localStorage.setItem('base-laying-rate', s);
        baseLayingRate.value = userData.value?.baseLayingRate ?? defaultBaseLayingRate;
    } else if (reset === true) {
        baseLayingRate.value = userData.value?.baseLayingRate ?? defaultBaseLayingRate;
    }
};

function validateBaseShippingRate(s, reset=false) {
    if (checkRateString(s, false)) {
        localStorage.setItem('base-shipping-rate', s);
        baseShippingRate.value = parseRateString(s);
    } else if (!s) {
        localStorage.setItem('base-shipping-rate', s);
        baseShippingRate.value = userData.value?.baseShippingRate ?? defaultBaseShippingRate;
    } else if (reset === true) {
        baseShippingRate.value = userData.value?.baseShippingRate ?? defaultBaseShippingRate;
    }
};


/*
 * Group artifacts by families
 * Artifacts that don't give any bonus are ignored, except for deflectors
 */
function getGroupedArtifacts(artifacts) {
    let ret = {};

    for (let item of artifacts) {
        if (item.category != T.ItemCategory.ARTIFACT)
            continue;
        const family = item.family;

        const {
            hab_capacity_bonus: habCapacityBonus,
            laying_bonus: layingBonus,
            shipping_bonus: shippingBonus,
            team_laying_bonus: deflectorBonus
        } = getEffects(item);
        item.layingBonus = (layingBonus ?? 1)*(habCapacityBonus ?? 1);
        item.shippingBonus = (shippingBonus ?? 1);
        item.deflectorBonus = (deflectorBonus ?? 0);

        if (item.layingBonus !== 1 || item.shippingBonus !== 1 || family == T.ArtifactFamily.TACHYON_DEFLECTOR) {
            if (!ret[family])
                ret[family] = [];
            ret[family].push(item);
        }
    }

    return ret;
}


/*
 * Return all candidate artifact sets
 * artifacts must have been grouped by families beforehand
 */
function getArtifactSets(artifacts) {
    const families = Object.keys(artifacts).sort();

    let sets = [];

    const artifactSlotAmount = userData.value?.proPermit ? 4 : 2;

    for (let size = 1; size <= artifactSlotAmount; size++) {
        for (const familySet of combinations(families, size)) {
            if (includeDeflector.value &&
                !familySet.some(family => family == T.ArtifactFamily.TACHYON_DEFLECTOR)) {
                continue;
            }

            for (const set of product(...familySet.map(key => artifacts[key]))) {
                const layingBonus = set.reduce((tot, cur) => tot*cur.layingBonus, 1);
                const shippingBonus = set.reduce((tot, cur) => tot*cur.shippingBonus, 1);
                const deflectorBonus = set.reduce((tot, cur) => tot+cur.deflectorBonus, 0);
                set.layingBonus = Math.round(layingBonus*1e10)/1e10;
                set.shippingBonus = Math.round(shippingBonus*1e10)/1e10;
                set.deflectorBonus = Math.round(deflectorBonus*1e10)/1e10;
                sets.push(set);
            }

        }
    }

    return sets;
}


function compute() {
    if (!userData.value) return [];

    // Group artifacts by families, sorted in prefered order
    const artifacts = getGroupedArtifacts(userData.value.items);
    for (const key in artifacts) {
        artifacts[key].sort((a, b) => b.deflectorBonus - a.deflectorBonus || b.tier - a.tier || b.rarity - a.rarity);
    }

    // Define the minimal deflector bonus allowed
    // For teamwork, take the highest deflector available
    // For contribution, only the presence of a deflector is forced, without minimum
    const minDeflectorBonus = includeDeflector.value && deflectorMode.value == "teamwork" ?
                              artifacts[T.ArtifactFamily.TACHYON_DEFLECTOR]?.[0]?.deflectorBonus ?? 0 :
                              0;

    // Remove suboptimal artifacts (outperformed by an other on both laying and shipping bonuses)
    for (const family in artifacts) {
        if (includeDeflector.value && family == T.ArtifactFamily.TACHYON_DEFLECTOR) {
            // Prevents removing deflectors, they may be suboptimal in regard to laying/shipping,
            // but still have a better bonus
            continue;
        }
        artifacts[family] = minmaxReduce(artifacts[family], 'layingBonus', 'shippingBonus', true);
    }

    // Get all candidate artifact sets, sorted to prefer higher deflector bonuses
    let sets = getArtifactSets(artifacts);
    sets = sets.filter((el) => el.deflectorBonus >= minDeflectorBonus);
    sets.sort((a, b) => b.deflectorBonus - a.deflectorBonus);

    // Get optimal sets
    sets = minmaxReduce(sets, 'layingBonus', 'shippingBonus', true);

    // A set is optimal when the deflector bonus received is shippingBonus/layingBonus
    // Sort them by optimal received deflector bonus
    sets.sort((a, b) => a.shippingBonus/a.layingBonus - b.shippingBonus/b.layingBonus);

    // Update the artifacts shown on the view
    entries.value = [];
    for (const set of sets) {
        set.sort((a, b) => a.family - b.family);
        entries.value.push({
            artifactSet: set,
        });
    }

    // Update the deflector bonuses on the axis
    updateScale();
}


/**
 * Recalculate deflector bonus from baseLayingRate, baseShippingRate and current artifact sets
 */
function updateScale() {

    let prevShippingRate = 0;

    for (const idx in entries.value) {
        const entry = entries.value[idx];
        const shippingRate = baseShippingRate.value * entry.artifactSet.shippingBonus;
        const layingRate = baseLayingRate.value * entry.artifactSet.layingBonus;

        let lowerThreshold = prevShippingRate/layingRate - 1;
        const optimalBonus = shippingRate/layingRate - 1;

        if (idx > 0) {
            entries.value[idx-1].higherThreshold = lowerThreshold;
        }
        entry.higherRate = shippingRate;

        if (lowerThreshold <= 0) {
            entry.lowerRate = Math.min(layingRate, shippingRate);
            entry.lowerThreshold = 0;
        } else {
            entry.lowerRate = prevShippingRate;
            entry.lowerThreshold = lowerThreshold;
        }

        if (optimalBonus <= 0) {
            entry.optiThreshold = 0;
            entry.optiRate = Math.min(layingRate, shippingRate);
        } else {
            entry.optiThreshold = optimalBonus;
            entry.optiRate = shippingRate;
        }


        prevShippingRate = shippingRate;
    }

    for (const entry of entries.value) {
        entry.hidden = entry.higherThreshold < 0;
    }

    // Log the values in console for easier data extraction
    let X = [], Y = [];
    for (const idx in entries.value) {
        X.push(entries.value[idx].lowerThreshold);
        X.push(entries.value[idx].optiThreshold);
        Y.push(entries.value[idx].lowerRate);
        Y.push(entries.value[idx].optiRate);
    }
    console.log('deflector bonuses', X);
    console.log('effective rates', Y);
}

</script>


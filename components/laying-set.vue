<template>
    <load-eid :inventory="inventory" @onloaded="(x) => inventory = x"></load-eid>
    <section class="settings">
        <div>
            <label class="tooltip-icon"
                title="Maximum laying rate with full habs, without any artifact equipped. At max Epic and Common Researches, it is 62.869T/min, or 3.772q/h. This is the default if no value is entered.">
                ⓘ
            </label>
            <label for="base-laying-rate">
                Base laying rate
            </label>
            <input type="text" id="base-laying-rate"
                :class="{ invalid: !checkRateString(baseLayingRateString) }"
                v-model="baseLayingRateString"
                @change="validateBaseLayingRate(baseLayingRateString)"
                placeholder="3.772q/h"
                ></input>
        </div>
        <div>
            <label class="tooltip-icon"
                title="Maximum shipping rate without any artifact equipped. At max Epic and Common Researches with all colleggtibles, it is 131.346T/min, or 7.881q/h. This is the default if no value is entered."
                > ⓘ
            </label>
            <label for="base-shipping-rate"
                > Base shipping rate
            </label>
            <input type="text" id="base-shipping-rate"
                :class="{ invalid: !checkRateString(baseShippingRateString) }"
                v-model="baseShippingRateString"
                @change="validateBaseShippingRate(baseShippingRateString)"
                placeholder="7.881q/h"
                ></input>
        </div>
        <div>
            <input type="checkbox" id="include-deflector" v-model="includeDeflector">
            <label for="include-deflector"
                title="Force the sets to contain a deflector"
                > Include a deflector
            </label>
        </div>
    </section>

    <pre v-if="errorMessage" class="invalid-text" style="white-space:preserve">{{ errorMessage }}</pre>

    <section class="main">
        <template v-for="entry in entries">
            <div v-if="!entry.hidden" class="threshold">
                <div class="threshold-label-frame" title="Deflector bonus (excluding yours)">
                    <div class="threshold-label">
                        <span v-if="entry.lowerThreshold >= 0">
                            + {{ entry.lowerThreshold.toLocaleString(undefined,{style: 'percent', minimumFractionDigits:0}) }}
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
                    <div v-if="entry.optiThreshold >= 0" class="optimal-label">
                        <span>
                            + {{ entry.optiThreshold.toLocaleString(undefined,{style: 'percent', minimumFractionDigits:0}) }}
                        </span>
                        <img src="/img/icons/deflector-bonus-alt.png"></img>
                    </div>
                </div>
                <inventory-view v-if="entry.artifactSet"
                    :artifacts="entry.artifactSet"
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
import { getBonus } from '/scripts/artifacts.ts';


// Template variables declarations and default values
const includeDeflector = ref(true);
const baseLayingRateString = ref("");
const baseLayingRate = ref(0);
const baseShippingRateString = ref("");
const baseShippingRate = ref(0);

const inventory = ref(null);
const entries = ref([]);
const entriesStart = ref(0);

const errorMessage = ref("");


Vue.onMounted(async () => {
    includeDeflector.value = JSON.parse(localStorage.getItem('include-deflector')) ??
                             includeDeflector.value;
    baseLayingRateString.value = localStorage.getItem('base-laying-rate') ??
                                 baseLayingRateString.value;
    baseShippingRateString.value = localStorage.getItem('base-shipping-rate') ??
                                   baseShippingRateString.value;

    validateBaseLayingRate(baseLayingRateString.value);
    validateBaseShippingRate(baseShippingRateString.value);

});


watch(includeDeflector, () => {
    localStorage.setItem('include-deflector', includeDeflector.value);
});
watch(inventory, () => {
    if (!inventory.value) return;
    localStorage.setItem('inventory', JSON.stringify(inventory.value));
    compute();
});
watch(includeDeflector, compute);
watch(baseLayingRate, updateScale);
watch(baseShippingRate, updateScale);


function validateBaseLayingRate(s) {
    if (s && !checkRateString(s))
        return;
    localStorage.setItem('base-laying-rate', s);
    // Default to the base max laying rate (max ER/CR/habs, without artifacts)
    baseLayingRate.value = s ? parseRateString(s) : 1047816000000.;
};

function validateBaseShippingRate(s) {
    if (s && !checkRateString(s))
        return;
    localStorage.setItem('base-shipping-rate', s);
    // Default to the base max shipping rate (max ER/CR/vehicles, without artifacts)
    // 2 colleggtibles adding 5% each to the base rate
    baseShippingRate.value = s ? parseRateString(s) : 1985572814941.4062*1.05**2;
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

        const { habCapacityBonus , layingBonus , shippingBonus, deflectorBonus } = getBonus(item);
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

    for (const size of [1, 2, 3, 4]) {
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
    if (!inventory.value) return [];

    // Group artifacts by families, sorted in prefered order
    const artifacts = getGroupedArtifacts(inventory.value.items);
    for (const key in artifacts) {
        artifacts[key].sort((a, b) => b.deflectorBonus - a.deflectorBonus || b.tier - a.tier || b.rarity - a.rarity);
    }

    // Remove suboptimal artifacts (outperformed by an other on both laying and shipping bonuses)
    for (const family in artifacts)
        artifacts[family] = minmaxReduce(artifacts[family], 'layingBonus', 'shippingBonus', true);

    // Get all candidate artifact sets, sorted to prefer higher deflector bonuses
    let sets = getArtifactSets(artifacts);
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

        entry.optiThreshold = optimalBonus;
        entry.optiRate = shippingRate;


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


<template>
    <load-eid :userData="userData" @onloaded="(x) => userData = x"></load-eid>
    <section class="settings">
        <span class="setting-entry">
            <label>
                <label tabindex="0" class="tooltip-icon">
                    ⓘ
                    <span class="tooltip-text">
                        none: do not force a deflector<br/>
                        contribution: includes the deflector that maximizes user contribution<br/>
                        teamwork: includes the deflector that maximizes teamwork
                    </span>
                </label>
                Deflector
            </label>
            <div class="switch">
                <label class="switch-option" for="deflector-mode-none">
                    <input type="radio" name="deflector-mode" id="deflector-mode-none"
                           :value="T.DeflectorMode.NONE" v-model="deflectorMode" />
                    <span>none</span>
                </label>
                <label class="switch-option" for="deflector-mode-contribution">
                    <input type="radio" name="deflector-mode" id="deflector-mode-contribution"
                           :value="T.DeflectorMode.CONTRIBUTION" v-model="deflectorMode" />
                    <span>contribution</span>
                </label>
                <label class="switch-option" for="deflector-mode-teamwork">
                    <input type="radio" name="deflector-mode" id="deflector-mode-teamwork"
                           :value="T.DeflectorMode.TEAMWORK" v-model="deflectorMode" />
                    <span>teamwork</span>
                </label>
            </div>
        </span>
        <span class="setting-entry">
            <label>
                <label tabindex="0" class="tooltip-icon">
                    ⓘ
                    <span class="tooltip-text">
                        Allow reslotting stones in artifacts.<br/>
                        Stone-holder artifacts are interchangeable and<br/>
                        stones may be arbitrarily rearranged.
                    </span>
                </label>
                Reslotting
            </label>
            <div class="switch">
                <label class="switch-option" for="reslotting-off">
                    <input type="radio" name="reslotting" id="reslotting-off"
                           :value="false" v-model="allowReslotting" />
                    <span>no</span>
                </label>
                <label class="switch-option" for="reslotting-on">
                    <input type="radio" name="reslotting" id="reslotting-on"
                           :value="true" v-model="allowReslotting" />
                    <span>yes</span>
                </label>
            </div>
        </span>
        <a href='#' v-if="!showExtraSettings" @click="showExtraSettings = true;">
            show settings
        </a>
        <span v-if="showExtraSettings" class="setting-entry">
            <label>
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
            </label>
            <input type="text" id="base-laying-rate"
                    :class="{ invalid: !baseLayingRateStringIsValid }"
                    v-model="baseLayingRateString"
                    :placeholder="formatRateString(userData?.baseLayingRate ?? DEFAULT_BASE_LAYING_RATE)">
            </input>
        </span>
        <span v-if="showExtraSettings" class="setting-entry">
            <label>
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
            </label>
            <input type="text" id="base-shipping-rate"
                    :class="{ invalid: !baseShippingRateStringIsValid }"
                    v-model="baseShippingRateString"
                    :placeholder="formatRateString(userData?.baseShippingRate ?? DEFAULT_BASE_SHIPPING_RATE)">
            </input>
        </span>
    </section>

    <pre v-if="errorMessage" class="invalid-text" style="white-space:preserve">{{ errorMessage }}</pre>

    <section class="main">
        <template v-for="entry in entries">
            <div v-if="!entry.hidden" class="threshold">
                <div class="threshold-label-frame" title="Deflector bonus (excluding yours)">
                    <div class="threshold-label">
                        <span v-if="entry.lowerThreshold !== undefined">
                            + {{ Math.max(0, entry.lowerThreshold).toLocaleString(undefined,{style: 'percent', minimumFractionDigits:0, roundingMode: 'ceil'}) }}
                        </span>
                        <img src="/img/icons/deflector-bonus.png"></img>
                    </div>
                </div>
                <span v-if="entry.lowerRate" class="threshold-rate">
                    <span class="threshold-rate-label">
                        laying rate
                    </span>
                    {{ formatRateString(entry.effectiveLowerRate) }}
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
                    :column=4 :row=1
                    :style="entry.rainbowed ? 'background: linear-gradient(to left, violet, indigo, blue, green, yellow, orange, red);' : ''">
                </inventory-view>
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
import { ref, watch } from 'vue';
import * as T from '/scripts/types.ts';
import { parseRateString, formatRateString } from '/scripts/utils.ts';
import { computeOptimalSetsWithReslotting, computeOptimalSetsWithoutReslotting } from '/scripts/laying-set.ts';


// These defaults are only used when no user data is loaded, or when it failed to calculate the rate from user data
// I'm using the value for max ER and CR without colleggtibles
const DEFAULT_BASE_LAYING_RATE = 1047816000000;
const DEFAULT_BASE_SHIPPING_RATE = 1985572814941.4062;


// Settings variables
const allowReslotting = ref<boolean>(false);
const deflectorMode = ref<T.DeflectorMode>(T.DeflectorMode.CONTRIBUTION);
const baseLayingRateString = ref("");
const baseShippingRateString = ref("");


// State variables
const showExtraSettings = ref<boolen>(false);
const errorMessage = ref("");
const baseLayingRateStringIsValid = ref(true);
const baseShippingRateStringIsValid = ref(true);
const baseLayingRate = ref(DEFAULT_BASE_LAYING_RATE);
const baseShippingRate = ref(DEFAULT_BASE_SHIPPING_RATE);


// Data variables
const userData = ref(null); // loaded via load-eid component
const entries = ref([]); // List of solutions (sets along additional info), populated via updateEntries


// Load settings from local storage at start
Vue.onMounted(async () => {
    const localStorageSettings = [
        { key: 'allow-reslotting'  , ref: allowReslotting , parser: JSON.parse },
        { key: 'deflector-mode'    , ref: deflectorMode   , parser: JSON.parse },
        { key: 'base-laying-rate'  , ref: baseLayingRateString   },
        { key: 'base-shipping-rate', ref: baseShippingRateString },
    ];

    localStorageSettings.forEach(({ key, ref, parser }) => {
        const storedValue = localStorage.getItem(key);
        if (storedValue !== null) {
            try {
                ref.value = parser ? parser(storedValue) : storedValue;
            } catch (e) {
                console.warn(`Failed to parse ${key} from localStorage:`, e);
                console.warn(`Stored value: ${storedValue}`);
            }
        }
    });

    // Show extra settings if they have been modified
    showExtraSettings.value = baseLayingRateString.value || baseShippingRateString.value;
});


// Watchers for synchronisation between setting variables, local storage and state variables
watch(allowReslotting , () => localStorage.setItem('allow-reslotting' , JSON.stringify(allowReslotting.value)));
watch(deflectorMode   , () => localStorage.setItem('deflector-mode'   , JSON.stringify(deflectorMode.value)));
watch(baseLayingRateString, () => updateBaseLayingRate(baseLayingRateString.value));
watch(baseShippingRateString, () => updateBaseShippingRate(baseShippingRateString.value));

watch(userData, () => {
    if (!userData.value) return;
    localStorage.setItem('user-data', JSON.stringify(userData.value));

    // Update rates in case a new default value must be taken into account
    updateBaseLayingRate(baseLayingRateString.value, true);
    updateBaseShippingRate(baseShippingRateString.value, true);
});

function updateBaseLayingRate(valueString, resetOnError = false) {
    try {
        const parsedValue = parseRateString(valueString);
        baseLayingRateStringIsValid.value = true;
        localStorage.setItem('base-laying-rate', valueString);
        baseLayingRate.value = parsedValue ?? userData.value?.baseLayingRate ?? DEFAULT_BASE_LAYING_RATE;;
    } catch (e) {
        baseLayingRateStringIsValid.value = false;
        if (resetOnError) {
            baseLayingRate.value = userData.value?.baseLayingRate ?? DEFAULT_BASE_LAYING_RATE;;
        }
    }
}

function updateBaseShippingRate(valueString, resetOnError = false) {
    try {
        const parsedValue = parseRateString(valueString);
        baseShippingRateStringIsValid.value = true;
        localStorage.setItem('base-shipping-rate', valueString);
        baseShippingRate.value = parsedValue ?? userData.value?.baseShippingRate ?? DEFAULT_BASE_SHIPPING_RATE;;
    } catch (e) {
        baseShippingRateStringIsValid.value = false;
        if (resetOnError) {
            baseShippingRate.value = userData.value?.baseShippingRate ?? DEFAULT_BASE_SHIPPING_RATE;;
        }
    }
}


// Watchers for triggering recomputations
watch(userData, updateEntries);
watch(allowReslotting, updateEntries);
watch(deflectorMode, updateEntries);

watch(entries, updateThresholds);
watch(baseLayingRate, updateThresholds);
watch(baseShippingRate, updateThresholds);


/**
 * Find the optimal sets and populate view entries
 */
function updateEntries() {
    console.log("Update entries");
    if (!userData.value) return [];

    const maxSlot = userData.value?.proPermit ? 4 : 2;
    let sets;
    try {
        errorMessage.value = "";
        sets = allowReslotting.value ?
               computeOptimalSetsWithReslotting(userData.value?.items ?? [], deflectorMode.value, maxSlot) :
               computeOptimalSetsWithoutReslotting(userData.value?.items ?? [], deflectorMode.value, maxSlot);
    } catch (e) {
        errorMessage.value = "An error occured.\nTry to clear your browser cache and reload your inventory.\nIf the error persist, contact the developper.\n\n"+e.message;
        entries.value = [];
        return;
    }

    // A set is optimal when the deflector bonus received is shippingBonus/maxLayingBonus
    // Sort them by optimal received deflector bonus
    sets.sort((a, b) => a.shippingBonus/a.maxLayingBonus - b.shippingBonus/b.maxLayingBonus);

    // Update the artifacts shown on the view
    entries.value = [];
    for (const equivalentSets of sets) {
        const set = equivalentSets[0];
        if (!set || set.length === 0) continue;

        set.sort((a, b) => a.family - b.family);

        while (set.length < maxSlot) set.push(null);

        entries.value.push({
            artifactSet: set,
            // LoE is invalid, because stones have no effect outside of enlightenment
            // Maybe the user knows more than me
            // Is it the secret of the soul?
            rainbowed: set.some(artifact => artifact && artifact.family === 0)
        });
    }
}


/**
 * Recalculate deflector bonuses and effective rates
 * Attach extra information to entries for more details in the view
 */
function updateThresholds() {
    console.log("Update thresholds");

    let prevShippingRate = 0;

    for (const idx in entries.value) {
        const entry = entries.value[idx];
        const shippingRate = baseShippingRate.value * entry.artifactSet.shippingBonus;
        const layingRate = baseLayingRate.value * entry.artifactSet.maxLayingBonus;

        let lowerThreshold = prevShippingRate/layingRate - 1;
        const optimalBonus = shippingRate/layingRate - 1;

        entry.lowerThreshold = lowerThreshold;
        entry.lowerRate = prevShippingRate;
        entry.effectiveLowerRate = lowerThreshold >= 0 ? prevShippingRate : Math.min(layingRate, shippingRate);

        entry.optiThreshold = optimalBonus;
        entry.optiRate = shippingRate;

        if (idx > 0) {
            entries.value[idx-1].higherThreshold = lowerThreshold;
        }
        entry.higherRate = shippingRate;
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
    console.log("Deflector bonuses:", X, "\nEffective rates  :", Y);
}


</script>

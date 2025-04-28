<template>
    <load-eid v-model="userData"/>

    <section class="settings">
        <setting-switch id="deflector-mode"
                        v-model="deflectorModeSetting"
                        label="Deflector"
                        tooltip="none: do not force a deflector<br/>
                                 contribution: deflector that maximizes user contribution<br/>
                                 teamwork: deflector that maximizes teamwork"
                        :options="[
                                  { value: T.DeflectorMode.NONE, label: 'none' },
                                  { value: T.DeflectorMode.CONTRIBUTION, label: 'contribution' },
                                  { value: T.DeflectorMode.TEAMWORK, label: 'teamwork' },
                                  ]"/>
        <setting-switch id="reslotting"
                        v-model="reslottingSetting"
                        label="Reslotting"
                        tooltip="Allow reslotting stones in artifacts.<br/>
                                 Stone-holder artifacts are interchangeable and<br/>
                                 stones may be arbitrarily rearranged."
                        :options="[
                                  { value: false, label: 'no' },
                                  { value: true, label: 'yes' },
                                  ]"/>
        <setting-switch id="gusset"
                        v-model="allowedGussetSetting"
                        label="Gusset"
                        tooltip="Force to use a specific gusset.<br/>
                                 Only your best gussets are shown.<br/>
                                 Disabled on 'any'."
                        :options="allowedGussetOptions"
                        @focusin="allowedGussetOnFocusIn"
                        @focusout="allowedGussetOnFocusOut">
            <template #option="{ label, img, cls }">
                <img v-if="img" :src="img" :alt="label" :class="cls"/>
                <span v-else v-html="label"/>
            </template>
            <template #extra>
                <button v-if="allowedGussetOptions.length < 10"
                   href="#"
                   class="switch-option extra-gusset-button"
                   @click="allowedGussetOptionsAll = true">
                    …
                </button>
            </template>
        </setting-switch>
        <setting-switch :hide="!showExtraSettings"
                        id="show-variants"
                        v-model="showVariantsSetting"
                        label="Show variants"
                        tooltip="Show variant sets,<br/>
                                 stone-holder artifacts are interchangeable.<br/>
                                 The view is limited to 6 sets"
                        :options="[
                                  { value: false, label: 'no' },
                                  { value: true, label: 'yes' },
                                  ]"/>
        <setting-text :hide="!showExtraSettings"
                      id="base-laying-rate"
                      v-model="baseLayingRateSetting"
                      label="Base laying rate"
                      tooltip="Maximum laying rate with full habs<br/>
                               without any artifact equipped."/>
        <setting-text :hide="!showExtraSettings"
                      id="base-shipping-rate"
                      v-model="baseShippingRateSetting"
                      label="Base shipping rate"
                      tooltip="Maximum shipping rate<br/>
                               without any artifact equipped."/>
        <a href='#' v-if="!showExtraSettings" @click="showExtraSettings = true;">
            more settings
        </a>
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
                        <img src="/img/icons/deflector-bonus.png" />
                    </div>
                </div>
                <span v-if="entry.effectiveLowerRate" class="threshold-rate">
                    <span class="threshold-rate-label">
                        laying rate
                    </span>
                    {{ formatRate(entry.effectiveLowerRate) }}
                </span>
            </div>
            <div v-if="!entry.hidden" class="entry">
                <div class="axis"></div>
                <div class="optimal-label-frame" title="Optimal deflector bonus for this set">
                    <div tabindex="0" v-if="entry.optiThreshold >= 0" class="optimal-label">
                        <span>
                            + {{ entry.optiThreshold.toLocaleString(undefined,{style: 'percent', minimumFractionDigits:0, roundingMode: 'ceil'}) }}
                        </span>
                        <img src="/img/icons/deflector-bonus-alt.png" />
                    </div>
                </div>
                <div class="entry-sets">
                    <inventory-frame v-if="entry.artifactSet"
                                     :artifacts="entry.artifactSet"
                                     :isSet="true"
                                     :deflectorBonus="entry.optiThreshold"
                                     :userData="userData"
                                     :column="4" :row="1"
                                     :style="entry.artifactSet.rainbowed ? 'background: linear-gradient(to left, violet, indigo, blue, green, yellow, orange, red);' : ''"
                                     />
                    <inventory-frame v-if="showVariantsSetting.value" v-for="subentry in entry.variants"
                                     :key="JSON.stringify(subentry)"
                                     :artifacts="subentry"
                                     :isSet="true"
                                     :deflectorBonus="entry.optiThreshold"
                                     :userData="userData"
                                     :column="4" :row="1"
                                     :style="subentry.rainbowed ? 'background: linear-gradient(to left, violet, indigo, blue, green, yellow, orange, red);' : ''"
                                     />
                </div>
            </div>
        </template>
        <template v-if="entries.length">
            <div class="threshold">
                <div class="threshold-label-frame">
                    <div class="threshold-label">
                        <img src="/img/icons/deflector-bonus.png" />
                    </div>
                </div>
                <span v-if="entries.at(-1)!.higherRate" class="threshold-rate">
                    <span class="threshold-rate-label">
                        laying rate
                    </span>
                    {{ formatRate(entries.at(-1)!.higherRate) }}
                </span>
            </div>
            <div class="entry">
                <div class="axis-end"></div>
            </div>
        </template>
        <img v-else-if="!userData" src="/img/laying-set-demo.png" class="demo-img" />
        <span v-else-if="!errorMessage && allowedGussetSetting.value !== T.AllowedGusset.ANY" class="invalid-text">
            You don't have enough artifacts to build a laying set<br />
            with the selected gusset filter.
        </span>
        <span v-else-if="!errorMessage" class="invalid-text">
            You don't have enough artifacts to build a laying set.
        </span>
    </section>
</template>

<style scoped src="@/styles/laying-set.css"></style>

<script setup lang="ts">
import { ref, shallowRef, computed, watch } from 'vue';
import * as T from '@/scripts/types.ts';
import { parseRate, formatRate } from '@/scripts/utils.ts';
import { createTextInputSetting, createSetting } from '@/scripts/settings.ts';
import { getOptimalGussets, computeOptimalSetsWithReslotting, computeOptimalSetsWithoutReslotting } from '@/scripts/laying-set.ts';
import type { ArtifactSet } from '@/scripts/laying-set.ts';

type EntryType = {
    artifactSet: (ArtifactSet<T.Artifact | null> & { rainbowed: boolean }),
    variants: (ArtifactSet<T.Artifact | null> & { rainbowed: boolean })[],
    hidden: boolean,
    lowerThreshold: number,
    lowerRate: number,
    effectiveLowerRate: number,
    optiThreshold: number,
    optiRate: number,
    higherThreshold: number,
    higherRate: number,
};

// These defaults are only used when no user data is loaded, or when it failed to calculate the rate from user data
// I'm using the value for max ER and CR without colleggtibles
const DEFAULT_BASE_LAYING_RATE = 1047816000000;
const DEFAULT_BASE_SHIPPING_RATE = 1985572814941.4062;


// Settings variables
const deflectorModeSetting = createSetting<T.DeflectorMode>({
    localStorageKey: 'laying-deflector-mode',
    defaultValue: T.DeflectorMode.TEAMWORK,
});
const reslottingSetting = createSetting<boolean>({
    localStorageKey: 'laying-reslotting',
    defaultValue: false,
});
const showVariantsSetting = createSetting<boolean>({
    localStorageKey: 'laying-variants',
    defaultValue: false,
});
const allowedGussetSetting = createSetting<T.AllowedGusset>({
    localStorageKey: 'laying-gusset-target',
    defaultValue: T.AllowedGusset.ANY,
});
const baseLayingRateSetting = createTextInputSetting<number|null>({
    localStorageKey: 'laying-base-laying-rate',
    defaultValue: null,
    parser: (s: string) => s ? parseRate(s) : null,
    formatter: (x: number|null): string => formatRate(x ?? baseLayingRate.value),
});
const baseShippingRateSetting = createTextInputSetting<number|null>({
    localStorageKey: 'laying-base-shipping-rate',
    defaultValue: null,
    parser: (s: string) => s ? parseRate(s) : null,
    formatter: (x: number|null): string => formatRate(x ?? baseShippingRate.value),
});


// When true, show every possible gussets
const allowedGussetOptionsAll = ref<boolean>(false);
let allowedGussetFocusTimer: ReturnType<typeof setTimeout>;
function allowedGussetOnFocusIn() { clearTimeout(allowedGussetFocusTimer); }
function allowedGussetOnFocusOut() {
    allowedGussetFocusTimer = setTimeout(() => allowedGussetOptionsAll.value = false, 200);
}
const allowedGussetOptions = computed(() => {
    const choices = allowedGussetOptionsAll.value ? Object.values(T.AllowedGusset) :
        [
            T.AllowedGusset.ANY,
            T.AllowedGusset.NONE,
            ...getOptimalGussets(userData.value?.items ?? [], !reslottingSetting.value)
        ];

    // Force selected option to show up
    if (!choices.includes(allowedGussetSetting.value)) {
        choices.push(allowedGussetSetting.value);
    }

    const ret = choices.sort().map(x => {
        if (x === T.AllowedGusset.ANY)  return { value: x, label: "any" };
        if (x === T.AllowedGusset.NONE) return { value: x, label: "Ø" };
        return { value: x, label: getGussetName(x), img: getGussetImage(x), cls: getGussetClass(x) };
    });
    return ret;
});



// State variables
const showExtraSettings = ref<boolean>(false);
const errorMessage = ref<string>("");
const baseLayingRate = computed<number>(() =>
    baseLayingRateSetting.value ?? userData.value?.baseLayingRate ?? DEFAULT_BASE_LAYING_RATE);
const baseShippingRate = computed<number>(() =>
    baseShippingRateSetting.value ?? userData.value?.baseShippingRate ?? DEFAULT_BASE_SHIPPING_RATE);


// Data variables
const userData = shallowRef<T.UserData>(); // loaded via load-eid component
const entries = shallowRef<EntryType[]>([]); // List of solutions (sets along additional info), populated via updateEntries



// Watchers for triggering recomputations
watch(userData, updateEntries);
watch(deflectorModeSetting, updateEntries);
watch(reslottingSetting, updateEntries);
watch(allowedGussetSetting, updateEntries);

watch(baseLayingRate, updateThresholds);
watch(baseShippingRate, updateThresholds);


/**
 * Find the optimal sets and populate view entries
 */
function updateEntries() {
    console.log("Update entries");

    const maxSlot: number = userData.value?.proPermit ? 4 : 2;
    let sets: ArtifactSet<T.Artifact | null>[][];
    try {
        errorMessage.value = "";
        sets = reslottingSetting.value ?
               computeOptimalSetsWithReslotting(userData.value?.items ?? [], deflectorModeSetting.value, maxSlot,
               allowedGussetSetting.value) :
               computeOptimalSetsWithoutReslotting(userData.value?.items ?? [], deflectorModeSetting.value, maxSlot,
               allowedGussetSetting.value);
    } catch (e) {
        errorMessage.value = "An error occured.\nTry to clear your browser cache and reload your inventory.\nIf the error persist, contact the developper.\n\n"+(e instanceof Error ? e.message : String(e));
        entries.value = [];
        return;
    }

    // A set is optimal when the deflector bonus received is shippingBonus/maxLayingBonus
    // Sort them by optimal received deflector bonus
    const sortKey = (x: ArtifactSet<T.Artifact | null>[]) => x[0]?.shippingBonus/(x[0]?.maxLayingBonus ?? x[0]?.layingBonus ?? 0);
    sets.sort((a, b) => sortKey(a) - sortKey(b));

    // Key for determining which artifact sets are considered the same when showVariants is on
    // Stone holders variations, artifact and stone order are ignored
    const contractFamilies = [
        T.ArtifactFamily.TACHYON_DEFLECTOR,
        T.ArtifactFamily.QUANTUM_METRONOME,
        T.ArtifactFamily.INTERSTELLAR_COMPASS,
        T.ArtifactFamily.GUSSET,
    ]
    function generateKey(set: ArtifactSet<T.Artifact | null>) {
        return set.map(artifact => {
            if (!artifact) return "null";
            const artiKey = contractFamilies.includes(artifact.family) ?
                `${artifact.category}-${artifact.family}-${artifact.tier}-${artifact.rarity}` :
                "holder";
            const stoneKeys = artifact?.stones.map(stone => (stone ?
                `${stone.category}-${stone.family}-${stone.tier}` :
                "null")) ?? [];
            return artiKey + "(" + stoneKeys.sort().join('+')+")";
        }).sort().join(',');
    }


    // Update the artifacts shown on the view
    entries.value = [];
    for (const equivalentSets of sets) {
        const set = equivalentSets[0] as ArtifactSet<T.Artifact | null> & { rainbowed: boolean };
        if (!set || set.length === 0) continue;

        // LoE is invalid, because stones have no effect outside of enlightenment
        // Maybe the user knows more than me
        // Is it the secret of the soul?
        set.rainbowed = set.some(artifact => artifact && artifact.family === 0);

        const seen = new Set();
        seen.add(generateKey(set));
        const variants = [];
        for (const eqSet of equivalentSets) {
            const variant = eqSet as ArtifactSet<T.Artifact | null> & { rainbowed: boolean };
            const key = generateKey(variant);
            if (seen.has(key)) continue;
            seen.add(key);
            variant.rainbowed = variant.some(artifact => artifact && artifact.family === 0);
            variants.push(variant);
            if (seen.size >= 6) break;
        }

        entries.value.push({
            artifactSet: set,
            variants: variants,
            hidden: false,
            lowerThreshold: NaN,
            lowerRate: NaN,
            effectiveLowerRate: NaN,
            optiThreshold: NaN,
            optiRate: NaN,
            higherThreshold: NaN,
            higherRate: NaN,
        });
    }

    updateThresholds();
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
        const layingRate = baseLayingRate.value * (entry.artifactSet.maxLayingBonus ??
        entry.artifactSet.layingBonus ?? 0);

        const lowerThreshold = prevShippingRate/layingRate - 1;
        const optimalBonus = shippingRate/layingRate - 1;

        entry.lowerThreshold = lowerThreshold;
        entry.lowerRate = prevShippingRate;
        entry.effectiveLowerRate = lowerThreshold >= 0 ? prevShippingRate : Math.min(layingRate, shippingRate);

        entry.optiThreshold = optimalBonus;
        entry.optiRate = shippingRate;

        if (Number(idx) > 0) {
            entries.value[Number(idx)-1].higherThreshold = lowerThreshold;
        }
        entry.higherRate = shippingRate;
        prevShippingRate = shippingRate;
    }

    for (const entry of entries.value) {
        entry.hidden = entry.higherThreshold < 0;
    }

    // Log the values in console for easier data extraction
    const X = [], Y = [];
    for (const idx in entries.value) {
        X.push(entries.value[idx].lowerThreshold);
        X.push(entries.value[idx].optiThreshold);
        Y.push(entries.value[idx].lowerRate);
        Y.push(entries.value[idx].optiRate);
    }
    console.log("Deflector bonuses:", X, "\nEffective rates  :", Y);
}


function getGussetName(gusset: string) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [category,family,tier,rarity] = gusset.split('-');
    return `t${tier}${"crel"[Number(rarity)]}`
}

function getGussetImage(gusset: string) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [category,family,tier,rarity] = gusset.split('-');
    return `/img/items/${category}-${family}-${tier}.png`
}

function getGussetClass(gusset: string) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [category,family,tier,rarity] = gusset.split('-');
    return ["common", "rare", "epic", "legendary"][Number(rarity)];
}

</script>

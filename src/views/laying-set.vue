<template>
    <load-eid :userData="userData" @onloaded="(x: T.UserData) => userData = x"></load-eid>
    <section class="settings">
        <span class="setting-entry">
            <label>
                <label tabindex="0" class="tooltip-icon">
                    ⓘ
                    <span class="tooltip-text">
                        none: do not force a deflector<br/>
                        contribution: deflector that maximizes user contribution<br/>
                        teamwork: deflector that maximizes teamwork
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
        <span class="setting-entry">
            <label>
                <label tabindex="0" class="tooltip-icon">
                    ⓘ
                    <span class="tooltip-text">
                        Force to use a specific gusset.<br/>
                        Only your best gussets are shown.<br/>
                        Disabled on "any".
                    </span>
                </label>
                Gusset
            </label>
            <div class="switch">
                <label v-for="gusset in allowedGussetChoices" :key="gusset" class="switch-option" :for="gusset">
                    <input type="radio" name="allowed-gusset" :id="gusset"
                           :value="gusset" v-model="allowedGusset" />
                    <span v-if="gusset === T.AllowedGusset.ANY">any</span>
                    <span v-else-if="gusset === T.AllowedGusset.NONE">Ø</span>
                    <img v-else :class="getGussetClass(gusset)"
                         :src="getGussetImage(gusset)"
                         :alt="getGussetName(gusset)"
                         />
                </label>
                <a v-if="allowedGussetChoices.length < 10"
                   href="#"
                   class="switch-option"
                   @click="allowedGussetChoices = Object.values(T.AllowedGusset)">
                    …
                </a>
            </div>
        </span>
        <span v-if="showExtraSettings || showExtraSettingVariant" class="setting-entry">
            <label>
                <label tabindex="0" class="tooltip-icon">
                    ⓘ
                    <span class="tooltip-text">
                        Show variant sets,<br/>
                        stone-holder artifacts are interchangeable.<br/>
                        The view is limited to 6 sets
                    </span>
                </label>
                Show variants
            </label>
            <div class="switch">
                <label class="switch-option" for="show-variant-off">
                    <input type="radio" name="show-variants" id="show-variant-off"
                           :value="false" v-model="showVariants" />
                    <span>no</span>
                </label>
                <label class="switch-option" for="show-variant-on">
                    <input type="radio" name="show-variants" id="show-variant-on"
                           :value="true" v-model="showVariants" />
                    <span>yes</span>
                </label>
            </div>
        </span>
        <span v-if="showExtraSettings || showExtraSettingLaying" class="setting-entry">
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
                    :class="{ invalid: !baseLayingRateSetting.isValid }"
                    v-model="baseLayingRateSetting.text"
                    :placeholder="baseLayingRateSetting.placeholder"
                    />
        </span>
        <span v-if="showExtraSettings || showExtraSettingShipping" class="setting-entry">
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
                    :class="{ invalid: !baseShippingRateSetting.isValid }"
                    v-model="baseShippingRateSetting.text"
                    :placeholder="baseShippingRateSetting.placeholder"
                    />
        </span>
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
                    <inventory v-if="entry.artifactSet"
                               :artifacts="entry.artifactSet"
                               :isSet="true"
                               :deflectorBonus="entry.optiThreshold"
                               :userData="userData"
                               :column="4" :row="1"
                               :style="entry.artifactSet.rainbowed ? 'background: linear-gradient(to left, violet, indigo, blu   242 e, green, yellow, orange, red);' : ''"
                               />
                    <inventory v-if="showVariants" v-for="subentry in entry.variants"
                               :artifacts="subentry"
                               :isSet="true"
                               :deflectorBonus="entry.optiThreshold"
                               :userData="userData"
                               :column="4" :row="1"
                               :style="subentry.rainbowed ? 'background: linear-gradient(to left, violet, indigo, blue, green,   250  yellow, orange, red);' : ''"
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
        <span v-else-if="!errorMessage && allowedGusset !== T.AllowedGusset.ANY" class="invalid-text">
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
import { onMounted, ref, computed, watch } from 'vue';
import * as T from '@/scripts/types.ts';
import { parseRate, formatRate, createTextInputSetting } from '@/scripts/utils.ts';
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
const deflectorMode = ref<T.DeflectorMode>(T.DeflectorMode.CONTRIBUTION);
const allowReslotting = ref<boolean>(false);
const showVariants = ref<boolean>(false);
const allowedGusset = ref<T.AllowedGusset>(T.AllowedGusset.ANY);
const baseLayingRateSetting = createTextInputSetting<number|null>({
    localStorageKey: 'base-laying-rate',
    defaultValue: DEFAULT_BASE_LAYING_RATE,
    parser: (s: string) => s ? parseRate(s) : null,
    formatter: (x: number|null): string => formatRate(x ?? baseLayingRate.value),
});
const baseShippingRateSetting = createTextInputSetting<number|null>({
    localStorageKey: 'base-shipping-rate',
    defaultValue: DEFAULT_BASE_SHIPPING_RATE,
    parser: (s: string) => s ? parseRate(s) : null,
    formatter: (x: number|null): string => formatRate(x ?? baseShippingRate.value),
});


// State variables
const showExtraSettings = ref<boolean>(false);
const showExtraSettingVariant = ref<boolean>(false);
const showExtraSettingLaying = ref<boolean>(false);
const showExtraSettingShipping = ref<boolean>(false);
const errorMessage = ref<string>("");
const allowedGussetChoices = ref<T.AllowedGusset[]>([T.AllowedGusset.ANY]);
const baseLayingRate = computed<number>(() =>
    baseLayingRateSetting.value ?? userData.value?.baseLayingRate ?? DEFAULT_BASE_LAYING_RATE);
const baseShippingRate = computed<number>(() =>
    baseShippingRateSetting.value ?? userData.value?.baseShippingRate ?? DEFAULT_BASE_LAYING_RATE);


// Data variables
const userData = ref<T.UserData>(null); // loaded via load-eid component
const entries = ref<EntryType[]>([]); // List of solutions (sets along additional info), populated via updateEntries


// Load settings from local storage at start
onMounted(async () => {
    const localStorageSettings = [
        { key: 'deflector-mode'    , ref: deflectorMode   , parser: JSON.parse },
        { key: 'allow-reslotting'  , ref: allowReslotting , parser: JSON.parse },
        { key: 'show-variants'     , ref: showVariants    , parser: JSON.parse },
        { key: 'allowed-gusset'    , ref: allowedGusset   , parser: JSON.parse },
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
    showExtraSettingVariant.value = showVariants.value !== false;
    showExtraSettingLaying.value = !!baseLayingRateSetting.text;
    showExtraSettingShipping.value = !!baseShippingRateSetting.text;
});


// Watchers for synchronisation between setting variables, local storage and state variables
watch(deflectorMode   , () => localStorage.setItem('deflector-mode'   , JSON.stringify(deflectorMode.value)));
watch(allowReslotting , () => localStorage.setItem('allow-reslotting' , JSON.stringify(allowReslotting.value)));
watch(showVariants    , () => localStorage.setItem('show-variants'    , JSON.stringify(showVariants.value)));
watch(allowedGusset   , () => localStorage.setItem('allowed-gusset'   , JSON.stringify(allowedGusset.value)));

watch(userData, () => {
    if (!userData.value) return;
    localStorage.setItem('user-data', JSON.stringify(userData.value));
});


// Watchers for triggering recomputations
watch(userData, updateEntries);
watch(deflectorMode, updateEntries);
watch(allowReslotting, updateEntries);
watch(allowedGusset, updateEntries);

watch(entries, updateAllowedGussets);
watch(baseLayingRate, updateThresholds);
watch(baseShippingRate, updateThresholds);


/**
 * Update default gussets shown to the user
 */
function updateAllowedGussets() {
    const choices = [T.AllowedGusset.ANY, T.AllowedGusset.NONE,
                     ...getOptimalGussets(userData.value?.items ?? [], !allowReslotting.value)];
    if (!choices.includes(allowedGusset.value)) {
        choices.push(allowedGusset.value);
    }
    allowedGussetChoices.value = choices.sort();
}


/**
 * Find the optimal sets and populate view entries
 */
function updateEntries() {
    console.log("Update entries");
    if (!userData.value) return [];

    const maxSlot: number = userData.value?.proPermit ? 4 : 2;
    let sets: ArtifactSet<T.Artifact | null>[][];
    try {
        errorMessage.value = "";
        sets = allowReslotting.value ?
               computeOptimalSetsWithReslotting(userData.value?.items ?? [], deflectorMode.value, maxSlot,
               allowedGusset.value) :
               computeOptimalSetsWithoutReslotting(userData.value?.items ?? [], deflectorMode.value, maxSlot,
               allowedGusset.value);
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
    const [category,family,tier,rarity] = gusset.split('-');
    return `t${tier}${"crel"[Number(rarity)]}`
}

function getGussetImage(gusset: string) {
    const [category,family,tier,rarity] = gusset.split('-');
    return `/img/items/${category}-${family}-${tier}.png`
}

function getGussetClass(gusset: string) {
    const [category,family,tier,rarity] = gusset.split('-');
    return ["common", "rare", "epic", "legendary"][Number(rarity)];
}

</script>

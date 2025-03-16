<template>
    <load-eid :userData="userData" @onloaded="(x: T.UserData) => userData = x"></load-eid>
    <section class="settings">
        <span class="setting-entry">
            <span>
                <span tabindex="0" class="tooltip-icon">
                    ⓘ
                    <span class="tooltip-text">
                        Swap to your best cube before<br/>
                        buying research,<br/>
                        or stay with the same set
                    </span>
                </span>
                Cube swapping
            </span>
            <div class="switch">
                <label class="switch-option" for="swap-cube-yes">
                    <input type="radio" name="swap-cube" id="swap-cube-yes"
                           :value="false" v-model="swapCube" />
                    <span>no</span>
                </label>
                <label class="switch-option" for="swap-cube-no">
                    <input type="radio" name="swap-cube" id="swap-cube-no"
                           :value="true" v-model="swapCube" />
                    <span>yes</span>
                </label>
            </div>
        </span>
        <span class="setting-entry">
            <label>
                <label tabindex="0" class="tooltip-icon">
                    ⓘ
                    <span class="tooltip-text">
                        Allow reslotting stones in artifacts.<br/>
                        Stones may be arbitrarily rearranged.
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
    </section>
    <section class="inputs">
        <span class="setting-entry">
            <label>
                <label tabindex="0" class="tooltip-icon">
                    ⓘ
                    <span class="tooltip-text">
                        Used to evaluate time to buy researches.
                    </span>
                </label>
                <label for="egg-value">
                    Egg value
                </label>
            </label>
            <input type="text" id="egg-value"
                   :class="{ invalid: !eggValueSetting.validText }"
                   v-model="eggValueSetting.text"
                   :placeholder="formatNumber(eggValueSetting.value ?? 0.05)">
            </input>
        </span>
        <span class="setting-entry">
            <label>
                <label tabindex="0" class="tooltip-icon">
                    ⓘ
                    <span class="tooltip-text">
                        Used to evaluate time to buy researches<br/>
                        with a mirror set.
                    </span>
                </label>
                <label for="mirror-eb">
                    Mirror mult.
                </label>
            </label>
            <input type="text" id="mirror-eb"
                   :class="{ invalid: !mirrorMultSetting.validText }"
                   v-model="mirrorMultSetting.text"
                   :placeholder="formatNumber(mirrorMultSetting.value ?? 1)">
            </input>
        </span>
        <span class="setting-entry">
            <label>
                <label tabindex="0" class="tooltip-icon">
                    ⓘ
                    <span class="tooltip-text">
                        Miscellaneous bonuses.<br/>
                        Includes video doubler,<br/>
                        earning event, sale event,<br/>
                        coop earning and laying bonuses.
                    </span>
                </label>
                <label for="misc-bonus">
                    Misc. bonuses
                </label>
            </label>
            <input type="text" id="misc-bonus"
                   :class="{ invalid: !miscBonusSetting.validText }"
                   v-model="miscBonusSetting.text"
                   :placeholder="formatNumber(miscBonusSetting.value ?? 1)">
            </input>
        </span>
    </section>

    <pre v-if="errorMessage" class="invalid-text" style="white-space:preserve">{{ errorMessage }}</pre>

    <section v-if="!errorMessage" class="main-sets">

        <template v-if="optimalEBSet?.ebMultiplier === optimalEarningSet?.ebMultiplier">
        <artifact-set-card v-if="optimalEBSet"
            title="EB/Earning set"
            description="Maximize your earnings<br/>and increase your EB<br/>to help teammates<br/>mirroring you"
            :set="optimalEBSet.set"
            :userData="userData"
            :baseEB="userEB"
            :multiplierEB="optimalEBSet.ebMultiplier"
            :multiplierOnline="optimalEBSet.onlineMultiplier"
            :researchCostMultiplier="swapCube ? optimalCubeBonus : optimalEBSet.researchCostBonus"
            >
            <div v-html="graphTitleHtml"/>
            <research-chart size="80%" :data="chartDataEB" />
        </artifact-set-card>
        </template>
        <template v-else>
        <artifact-set-card v-if="optimalEBSet"
            title="EB set"
            description="Increase your EB<br/>to help teammates<br/>mirroring you"
            :set="optimalEBSet.set"
            :userData="userData"
            :baseEB="userEB"
            :multiplierEB="optimalEBSet.ebMultiplier"
            :multiplierOnline="optimalEBSet.onlineMultiplier"
            :researchCostMultiplier="swapCube ? optimalCubeBonus : optimalEBSet.researchCostBonus"
            >
            <div v-html="graphTitleHtml"/>
            <research-chart size="80%" :data="chartDataEB" />
        </artifact-set-card>

        <artifact-set-card v-if="optimalEarningSet"
            title="Earning set"
            description="Maximize your earnings<br/>when not mirroring"
            :set="optimalEarningSet.set"
            :userData="userData"
            :baseEB="userEB"
            :multiplierEB="optimalEarningSet.ebMultiplier"
            :multiplierOnline="optimalEarningSet.onlineMultiplier"
            :researchCostMultiplier="swapCube ? optimalCubeBonus : optimalEarningSet.researchCostBonus"
            >
            <div v-html="graphTitleHtml"/>
            <research-chart size="80%" :data="chartDataEarning" />
        </artifact-set-card>
        </template>

        <artifact-set-card v-if="optimalMirrorSet"
            title="Mirror set"
            description="Maximize your earnings<br/>when mirroring"
            :set="optimalMirrorSet.set"
            :userData="userData"
            :baseEB="userEB"
            :multiplierEB="mirrorMult"
            :multiplierOnline="optimalMirrorSet.onlineMultiplier"
            :researchCostMultiplier="swapCube ? optimalCubeBonus : optimalMirrorSet.researchCostBonus"
            >
            <div v-html="graphTitleHtml"/>
            <research-chart size="80%" :data="chartDataMirror" />
        </artifact-set-card>
    </section>
</template>

<style scoped src="@/styles/earning-set.css"></style>

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted } from 'vue';
import * as T from '@/scripts/types.ts';
import { parseNumber, formatNumber, loadTextInputSetting, updateTextInputSetting } from '@/scripts/utils.ts';
import { searchEBSet, searchEarningSet, searchMirrorSet, searchCubeBonus } from '@/scripts/earning-set.ts';
import type { ArtifactSet } from '@/scripts/earning-set.ts';


const MIN_EGG_VALUE = 1e-7; // TODO: change to 0.05
const CR_TARGET_CNST = 3.340e45; // precomputed time constant for max shipping research


const graphTitleHtml = `
Can you
<span tabindex="0" class="tooltip-icon">
    max CR? <sup>ⓘ</sup>
    <span class="tooltip-text">
        Researches tiers 1 to 12 all maxed<br/>
        Matter Reconfiguration level 403<br/>
        Timeline Splicing level 0<br/>
        Hyper Portalling maxed<br/>
        Relativity Optimization maxed
    </span>
</span>
`;


// Settings variables
const allowReslotting = ref<boolean>(false);
const swapCube = ref<boolean>(false);
const eggValueSetting   = reactive<T.TextInputSetting>({ parser: parseNumber, localStorageId: "egg-value",
                                                         text: "", validText: false,
                                                         value: 0.05 });
const mirrorMultSetting = reactive<T.TextInputSetting>({ parser: parseNumber, localStorageId: "mirror-mult",
                                                         text: "", validText: false,
                                                         value: 1    });
const miscBonusSetting  = reactive<T.TextInputSetting>({ parser: parseNumber, localStorageId: "misc-bonus" ,
                                                         text: "", validText: false,
                                                         value: 2    });



// State variables
const errorMessage = ref<string>("");
const userEB = computed(() => (userData.value?.soulEggBonus ?? 0.1)*(userData.value?.soulEggs ?? 0)*
                              Math.pow(userData.value?.prophecyEggBonus ?? 1.05, userData.value?.prophecyEggs ?? 0));
const eggValue = computed(() => Math.max(MIN_EGG_VALUE, updateTextInputSetting(eggValueSetting)));
const mirrorMult = computed(() => Math.max(1, updateTextInputSetting(mirrorMultSetting)));
const miscBonus = computed(() => Math.max(1, updateTextInputSetting(miscBonusSetting)));



// Data variables
const userData = ref<T.UserData>(null); // loaded via load-eid component
const optimalEBSet = ref<ArtifactSet>();
const optimalEarningSet = ref<ArtifactSet>();
const optimalMirrorSet = ref<ArtifactSet>();
const optimalCubeBonus = ref<number>(1);
const chartDataEB = computed(() => generateChartData(optimalEBSet.value?.totalOnlineMultiplier ?? 540,
                                                     optimalEBSet.value?.researchCostBonus ?? 0.4));
const chartDataEarning = computed(() => generateChartData(optimalEarningSet.value?.totalOnlineMultiplier ?? 0.4,
                                                          optimalEarningSet.value?.researchCostBonus ?? 540));
const chartDataMirror = computed(() => generateChartData(optimalMirrorSet.value?.onlineMultiplier ?? 540,
                                                         optimalMirrorSet.value?.researchCostBonus ?? 0.4,
                                                         mirrorMult.value));



// Load settings from local storage at start
onMounted(async () => {
    const localStorageSettings = [
        { key: 'allow-reslotting', ref: allowReslotting, parser: JSON.parse },
        { key: 'swap-cube'       , ref: swapCube       , parser: JSON.parse },
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

    loadTextInputSetting(eggValueSetting);
    loadTextInputSetting(mirrorMultSetting);
    loadTextInputSetting(miscBonusSetting);

});


// Watchers for synchronisation between setting variables, local storage and state variables
watch(allowReslotting , () => localStorage.setItem('allow-reslotting', JSON.stringify(allowReslotting.value)));
watch(swapCube        , () => localStorage.setItem('swap-cube'       , JSON.stringify(swapCube.value)));

watch(userData, () => {
    if (!userData.value) return;
    localStorage.setItem('user-data', JSON.stringify(userData.value));
});


// Watchers for triggering recomputations
watch(userData, updateSet);
watch(allowReslotting, updateSet);
watch(swapCube, updateSet);


/**
 * Find the optimal sets and populate view entries
 */
function updateSet() {
    console.log("Update set");
    if (!userData.value) return [];

    const maxSlot: number = userData.value?.proPermit ? 4 : 2;
    const baseBonuses = {
        PECount    : userData.value?.prophecyEggs ?? 0,
        SECount    : userData.value?.soulEggs ?? 0,
        basePEBonus: userData.value?.prophecyEggBonus ?? 1.05,
        baseSEBonus: userData.value?.soulEggBonus ?? 0.1,
        baseRCBonus: userData.value?.mrcbEarningBonus ?? 5,
    };

    try {
        errorMessage.value = "";
        optimalEBSet.value = searchEBSet(userData.value?.items ?? [],
                                         maxSlot,
                                         baseBonuses,
                                         !swapCube.value,
                                         false, // countMonocle
                                         true, // online
                                         allowReslotting.value);
        optimalEarningSet.value = searchEarningSet(userData.value?.items ?? [],
                                                   maxSlot,
                                                   baseBonuses,
                                                   !swapCube.value,
                                                   false, // countMonocle
                                                   true, // online
                                                   allowReslotting.value);
        optimalMirrorSet.value = searchMirrorSet(userData.value?.items ?? [],
                                                 maxSlot,
                                                 baseBonuses,
                                                 !swapCube.value,
                                                 false, // countMonocle
                                                 true, // online
                                                 allowReslotting.value);
        optimalCubeBonus.value = swapCube.value ? searchCubeBonus(userData.value?.items ?? []) : 1;

    } catch (e) {
        errorMessage.value = "An error occured.\nTry to clear your browser cache and reload your inventory.\nIf the error persist, contact the developper.\n\n"+(e instanceof Error ? e.message : String(e));
        optimalEBSet.value = undefined;
        optimalEarningSet.value = undefined;
        optimalMirrorSet.value = undefined;
        optimalCubeBonus.value = 1;
        return;
    }
}

function generateChartData(artifactBonus: number, researchCostBonus: number, mirrorMult: number = 1) {
    if (swapCube.value) {
        artifactBonus /= optimalCubeBonus.value;
    } else {
        artifactBonus /= researchCostBonus;
    }
    const min = (userData.value?.baseEarningRate ?? 2/60)*60; // convert a rate /s to /min
    const max = CR_TARGET_CNST;

    const missing = max/(min * eggValue.value * miscBonus.value * artifactBonus * mirrorMult);
    let time = Math.min(Math.max(Math.round(Math.log(missing/643544)), 1), 10);
    const population = Math.min(missing/time, 10e9);
    // Complete with boost multipliers, capped at (50+50+50)×(50+50) for pro permit and 50×50 for free permit
    const boostBonus = Math.min(missing/(time*population), userData.value?.proPermit ? 15000 : 2500);
    time = missing/population/boostBonus;
    const complete = time <= 11;
    time = Math.min(time, 10);

    return {
        min: Math.log(min),
        max: Math.log(max/MIN_EGG_VALUE),
        multipliers: [
            {
                label: "Egg value",
                valueLabel: formatNumber(eggValue.value),
                color: "#228866",
                value: Math.log(eggValue.value / MIN_EGG_VALUE),
            }, {
                label: "Misc. bonuses",
                valueLabel: "×"+formatNumber(miscBonus.value),
                color: "#699b17",
                value: Math.log(miscBonus.value),
            }, {
                label: "Artifacts",
                valueLabel: "×"+formatNumber(artifactBonus),
                color: "#226f7e",
                value: Math.log(artifactBonus),
            }, {
                label: "Mirror",
                valueLabel: "×"+formatNumber(mirrorMult),
                color: "#492e8c",
                value: Math.log(mirrorMult),
            },
        ],
        population: {
            label: "Population",
            valueLabel: formatNumber(population, undefined, {maximumFractionDigits: 0}),
            color: "#279a40",
            value: Math.log(population),
        },
        boosts: {
            label: "Boosts",
            valueLabel: "×"+formatNumber(boostBonus, undefined, {maximumFractionDigits: 0}),
            color: "#cc7e33",
            value: Math.log(boostBonus),
        },
        time: {
            label: "Time",
            valueLabel: formatNumber(time, undefined, {maximumFractionDigits: 0})+" minute"+(time > 1 ? "s" : ""),
            color: "#aaa",
            value: Math.log(time),
        },
        complete,
    };
}


</script>

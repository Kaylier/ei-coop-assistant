<template>
    <load-eid :userData="userData" @onloaded="(x: T.UserData) => userData = x"></load-eid>
    <section class="settings">
        <setting-switch id="swap-cube"
                        v-model="swapCubeSetting"
                        label="Cube swapping"
                        tooltip="Swap to your best cube before<br/>
                                 buying research,<br/>
                                 or stay with the same set"
                        :options="[
                                  { value: false, label: 'no' },
                                  { value: true, label: 'yes' },
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
        <setting-switch id="online"
                        v-model="onlineSetting"
                        :options="[
                                  { value: true, label: 'online' },
                                  { value: false, label: 'offline' },
                                  ]"/>
    </section>
    <section class="inputs">
        <setting-text id="egg-value"
                      v-model="eggValueSetting"
                      label="Egg value"
                      tooltip="Used to evaluate time to buy researches."/>
        <setting-text id="mirror-eb"
                      v-model="mirrorSetting"
                      label="Mirror EB%"
                      tooltip="Used to evaluate time to buy researches<br/>
                               with a mirror set."/>
        <setting-text id="misc-bonus"
                      v-model="miscBonusSetting"
                      label="Misc. bonuses"
                      tooltip=" Miscellaneous bonuses.<br/>
                               Includes video doubler,<br/>
                               earning event, sale event,<br/>
                               coop earning and laying bonuses<br/>
                               and contract modifiers.<br/>
                               Default to 4"/>
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
            :multiplierOnline="onlineSetting.value ? optimalEBSet.onlineMultiplier : 0"
            :multiplierOffline="onlineSetting.value ? 0 : optimalEBSet.offlineMultiplier"
            :researchCostMultiplier="swapCubeSetting.value ? optimalCubeBonus : optimalEBSet.researchCostBonus"
            :swappedCube="swapCubeSetting.value && optimalCubeBonus < optimalEBSet.researchCostBonus ? optimalCube : null"
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
            :multiplierOnline="onlineSetting.value ? optimalEBSet.onlineMultiplier : 0"
            :multiplierOffline="onlineSetting.value ? 0 : optimalEBSet.offlineMultiplier"
            :researchCostMultiplier="swapCubeSetting.value ? optimalCubeBonus : optimalEBSet.researchCostBonus"
            :swappedCube="swapCubeSetting.value && optimalCubeBonus < optimalEBSet.researchCostBonus ? optimalCube : null"
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
            :multiplierOnline="onlineSetting.value ? optimalEarningSet.onlineMultiplier : 0"
            :multiplierOffline="onlineSetting.value ? 0 : optimalEarningSet.offlineMultiplier"
            :researchCostMultiplier="swapCubeSetting.value ? optimalCubeBonus : optimalEarningSet.researchCostBonus"
            :swappedCube="swapCubeSetting.value && optimalCubeBonus < optimalEarningSet.researchCostBonus ? optimalCube : null"
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
            :multiplierOnline="onlineSetting.value ? optimalMirrorSet.onlineMultiplier : 0"
            :multiplierOffline="onlineSetting.value ? 0 : optimalMirrorSet.offlineMultiplier"
            :researchCostMultiplier="swapCubeSetting.value ? optimalCubeBonus : optimalMirrorSet.researchCostBonus"
            :swappedCube="swapCubeSetting.value && optimalCubeBonus < optimalMirrorSet.researchCostBonus ? optimalCube : null"
            :activeMirror="mirrorMult > 1"
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
import { clamp, parseNumber, formatNumber } from '@/scripts/utils.ts';
import { createTextInputSetting, createSwitchSetting } from '@/scripts/settings.ts';
import { searchEBSet, searchEarningSet, searchMirrorSet, searchCube } from '@/scripts/earning-set.ts';
import type { ArtifactSet } from '@/scripts/earning-set.ts';


const MIN_EGG_VALUE = 0.01; // default base for showing egg value bonus in progress circle
const MIN_MISC_BONUS = 1; // default base for showing misc bonuses in progress circle
const CR_TARGET_CNST = 3.340e45; // precomputed time constant for max shipping research


const graphTitleHtml = `
Can you
<span tabindex="0" class="tooltip-icon">
    max CR? <sup>ⓘ</sup>
    <span class="tooltip-text">
        Matter Reconfiguration level 403<br/>
        Timeline Splicing level 0<br/>
        Every other researches maxed.<br/>
        <br/>
        It takes ~5 times longer to max everything
    </span>
</span>
`;


// Settings variables
const swapCubeSetting = createSwitchSetting<boolean>({
    localStorageKey: 'swap-cube',
    defaultValue: false,
});
const reslottingSetting = createSwitchSetting<boolean>({
    localStorageKey: 'allow-reslotting',
    defaultValue: false,
});
const onlineSetting = createSwitchSetting<boolean>({
    localStorageKey: 'online',
    defaultValue: true,
});
const eggValueSetting = createTextInputSetting<number>({
    localStorageKey: 'egg-value',
    queryParamKey: 'egg_value',
    defaultValue: 0.05,
    parser: parseNumber, formatter: formatNumber,
});
const mirrorSetting = createTextInputSetting<number>({
    localStorageKey: 'mirror',
    queryParamKey: 'mirror',
    defaultValue: 1,
    parser: parseNumber, formatter: formatNumber,
});
const miscBonusSetting = createTextInputSetting<number>({
    localStorageKey: 'misc-bonus',
    queryParamKey: 'misc_bonus',
    defaultValue: 4,
    parser: parseNumber, formatter: formatNumber,
});



// State variables
const errorMessage = ref<string>("");
const userEB = computed(() => (userData.value?.soulEggBonus ?? 0.1)*(userData.value?.soulEggs ?? 0)*
                              Math.pow(userData.value?.prophecyEggBonus ?? 1.05, userData.value?.prophecyEggs ?? 0));
const mirrorMult = computed(() => Math.max(1, mirrorSetting.value/100/userEB.value));



// Data variables
const userData = ref<T.UserData>(null); // loaded via load-eid component
const optimalEBSet = ref<ArtifactSet>();
const optimalEarningSet = ref<ArtifactSet>();
const optimalMirrorSet = ref<ArtifactSet>();
const optimalCube = ref<T.Artifact | null>();
const optimalCubeBonus = ref<number>(1);
const chartDataEB = computed(() => generateChartData(optimalEBSet.value));
const chartDataEarning = computed(() => generateChartData(optimalEarningSet.value));
const chartDataMirror = computed(() => generateChartData(optimalMirrorSet.value,
                                                         mirrorMult.value));



// Watchers for synchronisation between setting variables, local storage and state variables

watch(userData, () => {
    if (!userData.value) return;
    localStorage.setItem('user-data', JSON.stringify(userData.value));
});


// Watchers for triggering recomputations
watch(userData, updateSet);
watch(swapCubeSetting, updateSet);
watch(reslottingSetting, updateSet);
watch(onlineSetting, updateSet);


/**
 * Find the optimal sets and populate view entries
 */
function updateSet() {
    if (!userData.value) return [];
    console.log("Update sets");

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
                                         !swapCubeSetting.value,
                                         false, // countMonocle
                                         onlineSetting.value,
                                         reslottingSetting.value);
        console.log("EB set:", optimalEBSet.value);
        optimalEarningSet.value = searchEarningSet(userData.value?.items ?? [],
                                                   maxSlot,
                                                   baseBonuses,
                                                   !swapCubeSetting.value,
                                                   false, // countMonocle
                                                   onlineSetting.value,
                                                   reslottingSetting.value);
        console.log("Earning set:", optimalEarningSet.value);
        optimalMirrorSet.value = searchMirrorSet(userData.value?.items ?? [],
                                                 maxSlot,
                                                 baseBonuses,
                                                 !swapCubeSetting.value,
                                                 false, // countMonocle
                                                 onlineSetting.value,
                                                 reslottingSetting.value);
        console.log("Mirror set:", optimalMirrorSet.value);
        const [cube, cubeBonus] = searchCube(userData.value?.items ?? []);
        console.log("Cube:", cubeBonus, cube);
        optimalCube.value = cube;
        optimalCubeBonus.value = cubeBonus;

    } catch (e) {
        errorMessage.value = "An error occured.\nTry to clear your browser cache and reload your inventory.\nIf the error persist, contact the developper.\n\n"+(e instanceof Error ? e.message : String(e));
        optimalEBSet.value = undefined;
        optimalEarningSet.value = undefined;
        optimalMirrorSet.value = undefined;
        optimalCube.value = undefined;
        optimalCubeBonus.value = 1;
        return;
    }
}

function generateChartData(artifactSet?: ArtifactSet, mirrorMult: number = 1) {
    let artifactBonus = onlineSetting.value ? (artifactSet?.totalOnlineMultiplier ?? 540)
                                            : (artifactSet?.totalOfflineMultiplier ?? 1);
    artifactBonus /= swapCubeSetting.value ? optimalCubeBonus.value : (artifactSet?.researchCostBonus ?? 1);

    let min = (userData.value?.baseEarningRate ?? 2/60)*60; // convert a rate /s to /min
    if (!onlineSetting.value) min *= userData.value?.awayEarningBonus ?? 1;
    const max = CR_TARGET_CNST;

    let missing = max/(min * eggValueSetting.value * miscBonusSetting.value * artifactBonus * mirrorMult);

    // Evaluate time and population required (heuristic formula, we need time*population ~= missing)
    const time = clamp(Math.round(Math.log(missing/(onlineSetting.value ? 4539993 : 453999))), 1, 10);
    const population = clamp(missing/time, 1, 10e9);
    missing /= (time*population);

    // Complete with boost multipliers, capped at (50+50+50)×(50+50) for pro permit and 50×50 for free permit
    let boostBonus = clamp(missing, 1, userData.value?.proPermit ? 15000 : 2500);
    if (boostBonus < missing) {
        // If not enough, show numbers without boosts
        boostBonus = 1;
    }
    missing /= boostBonus;


    const populationLabel = formatNumber(population, undefined, {maximumFractionDigits: 0});
    const boostLabel = "×"+formatNumber(boostBonus, undefined, {maximumFractionDigits: 0});
    const timeLabel = formatNumber(time, undefined, {maximumFractionDigits: 0})+" minute"+(time > 1 ? "s" : "");
    const missingLabel = "×"+formatNumber(missing, undefined, {maximumFractionDigits: 0});

    return {
        multipliers: [
            {
                label: "Egg value",
                valueLabel: formatNumber(eggValueSetting.value),
                color: "#228866",
                value: Math.log(Math.max(eggValueSetting.value/MIN_EGG_VALUE, 1)),
            }, {
                label: "Misc. bonuses",
                valueLabel: "×"+formatNumber(miscBonusSetting.value),
                color: "#699b17",
                value: Math.log(Math.max(miscBonusSetting.value/MIN_MISC_BONUS, 1)),
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
            {
                label: "Population",
                valueLabel: populationLabel,
                color: "#279a40",
                value: Math.log(population),
            },
            {
                label: "Time",
                valueLabel: timeLabel,
                color: "#aaa",
                value: Math.log(time),
            },
            {
                label: "Boosts",
                valueLabel: boostLabel,
                color: "#cc7e33",
                value: Math.log(boostBonus),
            },
            {
                label: "Missing",
                valueLabel: missingLabel,
                color: "#832",
                value: Math.log(missing),
            },
        ],
        population: populationLabel,
        boosts: boostLabel,
        time: timeLabel,
        missing: missingLabel,
        hasMissing: missing > 1.5,
        hasBoosts: boostBonus > 1.5,
    };
}


</script>

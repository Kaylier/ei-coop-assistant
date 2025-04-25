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
    <section id="inputs">
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

    <section v-if="!errorMessage" id="main-sets">

        <template v-if="mergeEBEarningSets">
        <artifact-set-card v-if="optimalEBSet"
            title="EB/Earning set"
            description="Maximize your earnings<br/>and increase your EB<br/>to help teammates<br/>mirroring you"
            :userData="userData"
            :set="optimalEarningSet"
            :externalCube="swapCubeSetting.value ? optimalCube : null"
            :stats="['eb', onlineSetting.value ? 'rcb' : 'away', 'cr']"
            :substats="['rcb', 'away', 'ihr', 'hab', 'lay', 'ship']"
            >
            <div v-html="graphTitleHtml"/>
            <research-chart size="80%" :data="generateChartData(optimalEBSet)" />
        </artifact-set-card>
        </template>
        <template v-else>
        <artifact-set-card v-if="optimalEBSet"
            title="EB set"
            description="Increase your EB<br/>to help teammates<br/>mirroring you"
            :userData="userData"
            :set="optimalEBSet"
            :externalCube="swapCubeSetting.value ? optimalCube : null"
            :stats="['eb', onlineSetting.value ? 'rcb' : 'away', 'cr']"
            :substats="['rcb', 'away', 'ihr', 'hab', 'lay', 'ship']"
            >
            <div v-html="graphTitleHtml"/>
            <research-chart size="80%" :data="generateChartData(optimalEBSet)" />
        </artifact-set-card>

        <artifact-set-card v-if="optimalEarningSet"
            title="Earning set"
            description="Maximize your earnings<br/>when not mirroring"
            :userData="userData"
            :set="optimalEarningSet"
            :externalCube="swapCubeSetting.value ? optimalCube : null"
            :stats="['eb', onlineSetting.value ? 'rcb' : 'away', 'cr']"
            :substats="['rcb', 'away', 'ihr', 'hab', 'lay', 'ship']"
            >
            <div v-html="graphTitleHtml"/>
            <research-chart size="80%" :data="generateChartData(optimalEarningSet)" />
        </artifact-set-card>
        </template>

        <artifact-set-card v-if="optimalMirrorSet"
            title="Mirror set"
            description="Maximize your earnings<br/>when mirroring"
            :userData="userData"
            :set="optimalMirrorSet"
            :externalCube="swapCubeSetting.value ? optimalCube : null"
            :mirror="mirrorMult"
            :stats="['eb', onlineSetting.value ? 'rcb' : 'away', 'cr']"
            :substats="['rcb', 'away', 'ihr', 'hab', 'lay', 'ship']"
            >
            <div v-html="graphTitleHtml"/>
            <research-chart size="80%" :data="generateChartData(optimalMirrorSet, mirrorMult)" />
        </artifact-set-card>
    </section>
</template>

<style scoped src="@/styles/earning-set.css"></style>

<script setup lang="ts">
import { ref, shallowRef, computed, watch } from 'vue';
import * as T from '@/scripts/types.ts';
import { clamp, isclose, parseNumber, formatNumber } from '@/scripts/utils.ts';
import { createTextInputSetting, createSetting } from '@/scripts/settings.ts';
import { searchEBSet, searchEarningSet, searchMirrorSet, searchCube } from '@/scripts/earning-set.ts';


const DEFAULT_EGG_VALUE = 0.05;
const DEFAULT_MISC_VALUE = 4;
const DEFAULT_MIRROR_VALUE = 1e24;

const MIN_EGG_VALUE = 0.01; // default base for showing egg value bonus in progress circle
const MIN_MISC_BONUS = 1; // default base for showing misc bonuses in progress circle
const CR_TARGET_CNST = 3.340e45; // precomputed time constant for max shipping research


const graphTitleHtml = `
Can you
<span tabindex="0" class="tooltip-icon">
    max relevant CR? <sup>ⓘ</sup>
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
const swapCubeSetting = createSetting<boolean>({
    localStorageKey: 'earning-cube-swap',
    defaultValue: false,
});
const reslottingSetting = createSetting<boolean>({
    localStorageKey: 'earning-reslotting',
    defaultValue: false,
});
const onlineSetting = createSetting<boolean>({
    localStorageKey: 'earning-online',
    defaultValue: true,
});
const eggValueSetting = createTextInputSetting<number>({
    localStorageKey: 'earning-egg-value',
    queryParamKey: 'egg_value',
    defaultValue: DEFAULT_EGG_VALUE,
    parser: (s: string) => s ? parseNumber(s) : DEFAULT_EGG_VALUE,
    formatter: formatNumber,
});
const mirrorSetting = createTextInputSetting<number>({
    localStorageKey: 'earning-mirror',
    queryParamKey: 'mirror',
    defaultValue: DEFAULT_MIRROR_VALUE,
    parser: (s: string) => s ? parseNumber(s) : DEFAULT_MIRROR_VALUE,
    formatter: formatNumber,
});
const miscBonusSetting = createTextInputSetting<number>({
    localStorageKey: 'earning-misc-bonus',
    queryParamKey: 'misc_bonus',
    defaultValue: DEFAULT_MISC_VALUE,
    parser: (s: string) => s ? parseNumber(s) : DEFAULT_MISC_VALUE,
    formatter: formatNumber,
});



// State variables
const errorMessage = ref<string>("");
const userEB = computed(() => 1 + (userData.value?.soulEggBonus ?? 0.1)*(userData.value?.soulEggs ?? 0)*
                              Math.pow(userData.value?.prophecyEggBonus ?? 1.05, userData.value?.prophecyEggs ?? 0));
const mirrorMult = computed(() => Math.max(1, mirrorSetting.value/100/userEB.value));



// Data variables
const userData = shallowRef<T.UserData>(null); // loaded via load-eid component
const optimalEBSet = shallowRef<T.ArtifactSet|null>(null);
const optimalEarningSet = shallowRef<T.ArtifactSet|null>(null);
const optimalMirrorSet = shallowRef<T.ArtifactSet|null>(null);
const optimalCube = shallowRef<T.Artifact|null>(null);
const optimalCubeBonus = ref<number>(1);
const mergeEBEarningSets = ref<boolean>(false);



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

        mergeEBEarningSets.value = isclose(getEBMultiplier(optimalEBSet.value), getEBMultiplier(optimalEarningSet.value));

    } catch (e) {
        errorMessage.value = "An error occured.\nTry to clear your browser cache and reload your inventory.\nIf the error persist, contact the developper.\n\n"+(e instanceof Error ? e.message : String(e));
        optimalEBSet.value = null;
        optimalEarningSet.value = null;
        optimalMirrorSet.value = null;
        optimalCube.value = null;
        optimalCubeBonus.value = 1;
        mergeEBEarningSets.value = false;
        return;
    }
}

function getEBMultiplier(set: T.ArtifactSet|null): number {
    if (!set) return 1;
    const SEBonus: number = set.effects.get('soul_egg_bonus');
    const baseSEBonus: number = userData.value?.soulEggBonus ?? 0.1;
    const PEBonus: number = set.effects.get('prophecy_egg_bonus');
    const basePEBonus: number = userData.value?.prophecyEggBonus ?? 1.05;
    const PECount: number = userData.value?.prophecyEggs ?? 0;
    return (1 + SEBonus/baseSEBonus)*Math.pow(1 + PEBonus/basePEBonus, PECount);
}

function generateChartData(set: T.ArtifactSet, mirrorMult?: number) {
    let artifactBonus: number = set.effects.get('egg_value_bonus')*set.effects.get('laying_bonus');
    if (onlineSetting.value) {
        artifactBonus *= ((userData.value?.mrcbEarningBonus ?? 5) + set.effects.get('running_chicken_bonus'));
    } else {
        artifactBonus *= set.effects.get('away_earning_bonus');
    }
    if (!mirrorMult) {
        artifactBonus *= getEBMultiplier(set);
    }
    if (swapCubeSetting.value) {
        artifactBonus /= optimalCubeBonus.value;
    } else {
        artifactBonus /= set.effects.get('research_cost_bonus');
    }


    let min = (userData.value?.baseEarningRate ?? 2/60)*60; // convert a rate from /s to /min
    if (!onlineSetting.value) min *= userData.value?.awayEarningBonus ?? 1;
    const max = CR_TARGET_CNST;


    mirrorMult = mirrorMult ?? 1;
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

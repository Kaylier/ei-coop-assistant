<template>
    <load-eid v-model="userData"/>
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

    <section v-if="!errorMessage && userData" id="main-sets">

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
            :mirror="mirrorSetting.value"
            :stats="['eb', onlineSetting.value ? 'rcb' : 'away', 'cr']"
            :substats="['rcb', 'away', 'ihr', 'hab', 'lay', 'ship']"
            >
            <div v-html="graphTitleHtml"/>
            <research-chart size="80%" :data="generateChartData(optimalMirrorSet, true)" />
        </artifact-set-card>
    </section>
</template>

<style scoped src="@/styles/earning-set.css"></style>

<script setup lang="ts">
import { ref, shallowRef, watch } from 'vue';
import * as T from '@/scripts/types.ts';
import { clamp, isclose, parseNumber, formatNumber } from '@/scripts/utils.ts';
import { createTextInputSetting, createSetting } from '@/scripts/settings.ts';
import { searchEBSet, searchEarningSet, searchMirrorSet, searchCube } from '@/scripts/earning-set.ts';
import { Effects } from '@/scripts/effects.ts';


const DEFAULT_EGG_VALUE = 0.05;
const DEFAULT_MISC_VALUE = 4;
const DEFAULT_MIRROR_VALUE = 1e22;

const MIN_EGG_VALUE = 0.01; // default base for showing egg value bonus in progress circle
const MIN_MISC_BONUS = 1; // default base for showing misc bonuses in progress circle
const CR_TARGET_CNST = 1.268e45*3.751861484591138e+22; // precomputed time constant for max shipping research
//const CR_TARGET_CNST = 3.340e45; // precomputed time constant for max shipping research


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
    parser: (s: string) => s ? parseNumber(s)/100 : DEFAULT_MIRROR_VALUE,
    formatter: (x: number) => formatNumber(x*100),
});
const miscBonusSetting = createTextInputSetting<number>({
    localStorageKey: 'earning-misc-bonus',
    queryParamKey: 'misc_bonus',
    defaultValue: DEFAULT_MISC_VALUE,
    parser: (s: string) => s ? parseNumber(s) : DEFAULT_MISC_VALUE,
    formatter: formatNumber,
});



const errorMessage = ref<string>("");


const userData = shallowRef<T.UserData>(); // loaded via load-eid component
const optimalEBSet = shallowRef<T.ArtifactSet|null>(null);
const optimalEarningSet = shallowRef<T.ArtifactSet|null>(null);
const optimalMirrorSet = shallowRef<T.ArtifactSet|null>(null);
const optimalCube = shallowRef<T.Artifact|null>(null);
const swappedCubeMult = ref<number>(1);
const mergeEBEarningSets = ref<boolean>(false);



// Watchers for triggering recomputations
watch(userData, updateSet);
watch(swapCubeSetting, updateSet);
watch(reslottingSetting, updateSet);
watch(onlineSetting, updateSet);


/**
 * Find the optimal sets and populate view entries
 */
function updateSet() {
    console.log("Update sets");

    const maxSlot: number = userData.value?.proPermit ? 4 : 2;

    try {
        errorMessage.value = "";
        optimalEBSet.value = searchEBSet(userData.value?.items ?? [],
                                         maxSlot,
                                         userData.value?.maxedEffects ?? Effects.initial,
                                         !swapCubeSetting.value,
                                         false, // countMonocle
                                         onlineSetting.value,
                                         reslottingSetting.value);
        console.log("EB set:", optimalEBSet.value);
        optimalEarningSet.value = searchEarningSet(userData.value?.items ?? [],
                                                   maxSlot,
                                                   userData.value?.maxedEffects ?? Effects.initial,
                                                   !swapCubeSetting.value,
                                                   false, // countMonocle
                                                   onlineSetting.value,
                                                   reslottingSetting.value);
        console.log("Earning set:", optimalEarningSet.value);
        optimalMirrorSet.value = searchMirrorSet(userData.value?.items ?? [],
                                                 maxSlot,
                                                 userData.value?.maxedEffects ?? Effects.initial,
                                                 !swapCubeSetting.value,
                                                 false, // countMonocle
                                                 onlineSetting.value,
                                                 reslottingSetting.value);
        console.log("Mirror set:", optimalMirrorSet.value);
        const [cube, cubeBonus] = searchCube(userData.value?.items ?? []);
        console.log("Cube:", cubeBonus, cube);
        optimalCube.value = cube;
        swappedCubeMult.value = cubeBonus*(userData.value?.baseEffects.research_cost_mult ?? 1);

        mergeEBEarningSets.value = isclose(getEBMultiplier(optimalEBSet.value), getEBMultiplier(optimalEarningSet.value));

    } catch (e) {
        errorMessage.value = "An error occured.\nTry to clear your browser cache and reload your inventory.\nIf the error persist, contact the developper.\n\n"+(e instanceof Error ? e.message : String(e));
        optimalEBSet.value = null;
        optimalEarningSet.value = null;
        optimalMirrorSet.value = null;
        optimalCube.value = null;
        swappedCubeMult.value = userData.value?.baseEffects.research_cost_mult ?? 1;
        mergeEBEarningSets.value = false;
        return;
    }
}

function getEBMultiplier(set: T.ArtifactSet|null): number {
    if (!set) return 1;
    const userEffects = userData.value?.maxedEffects ?? Effects.initial;
    return new Effects(userEffects, set.effects).eb/userEffects.eb;
}

function generateChartData(set: T.ArtifactSet, mirroring: boolean = false) {
    const userEffects = userData.value?.maxedEffects ?? Effects.initial;
    const combEffects = new Effects(userEffects, set.effects);

    // Rate from naked user with initial farm, ×60 to get it in /min
    let userRate: number = 60;
    userRate *= userEffects.laying_rate;
    userRate *= userEffects.egg_value_mult;
    userRate *= userEffects.earning_mult;
    userRate *= onlineSetting.value ? userEffects.earning_mrcb_mult : userEffects.earning_away_mult;
    userRate *= userEffects.eb;
    userRate /= userEffects.research_cost_mult;

    // Rate from clothed user with initial farm, ×60 to get it in /min
    let combRate: number = 60;
    combRate *= combEffects.laying_rate;
    combRate *= combEffects.egg_value_mult;
    combRate *= combEffects.earning_mult;
    combRate *= onlineSetting.value ? combEffects.earning_mrcb_mult : combEffects.earning_away_mult;
    combRate *= combEffects.eb;
    combRate /= swapCubeSetting.value ? swappedCubeMult.value : combEffects.research_cost_mult;

    // Mirror multiplier, from user clothed EB
    const mirrorMult = mirroring ? Math.max(1, mirrorSetting.value/combEffects.eb) : 1;

    let missing = CR_TARGET_CNST;
    missing /= eggValueSetting.value;
    missing /= miscBonusSetting.value;
    missing /= combRate;
    missing /= mirrorMult;

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
                valueLabel: "×"+formatNumber(combRate/userRate),
                color: "#226f7e",
                value: Math.log(combRate/userRate),
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

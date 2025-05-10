<template>
    <load-eid v-model="userData"/>

    <section class="settings">
        <setting-switch id="reslotting"
                        v-model="reslottingSetting"
                        label="Reslotting"
                        tooltip="Allow reslotting stones in artifacts.<br/>
                                 Stone-holder artifacts are interchangeable and<br/>
                                 stones may be arbitrarily rearranged.<br/>
                                 Select 'add' to keep already slotted stones."
                        :options="[
                                  { value: 0, label: 'no' },
                                  { value: 1, label: 'add' },
                                  { value: 3, label: 'swap' },
                                  ]"/>
        <setting-text id="event-earnings"
                      v-model="eventEarningsSetting"
                      label="Earning event"
                      :small="true"/>
        <setting-text id="event-prestige"
                      v-model="eventPrestigeSetting"
                      label="Prestige event"
                      :small="true"/>

    </section>
    <section id="inputs">
        <setting-switch id="online"
                        v-model="onlineSetting"
                        :options="[
                                  { value: true, label: 'online' },
                                  { value: false, label: 'offline' },
                                  ]"/>
        <setting-switch id="multistige"
                        v-model="multistigeSetting"
                        :options="[
                                  { value: false, label: 'single-stige' },
                                  { value: true, label: 'multi-stige' },
                                  ]"/>
    </section>
    <section class="settings">
        <setting-switch v-if="multistigeSetting.value" id="swapIHR"
                        v-model="swapIHRSetting"
                        label="Use IHR set"
                        tooltip="Use IHR set during building phase."
                        :options="[
                                  { value: false, label: 'no' },
                                  { value: true, label: 'yes' },
                                  ]"/>
        <setting-text v-if="multistigeSetting.value" id="build-time"
                      v-model="buildTimeSetting"
                      label="Build time (seconds)"
                      tooltip="Boost time spent without significant<br/>
                               earnings during a leg."
                      :small="true"
                      inputmode="numeric"/>
        <setting-text v-if="multistigeSetting.value" id="leg-count"
                      v-model="legCountSetting"
                      label="Legs count"
                      tooltip="Amount of legs during multis.<br/>
                               Leave empty for best overall guess."
                      :small="true"
                      inputmode="numeric"/>
        <setting-text v-if="multistigeSetting.value" id="starting-population"
                      v-model="startingPopulationSetting"
                      label="Start population"
                      tooltip="Population when earnings start during multis.<br/>
                               Ignored for piggystiges."/>
    </section>

    <pre v-if="errorMessage" class="invalid-text" style="white-space:preserve">{{ errorMessage }}</pre>

    <section v-if="!errorMessage && userData" id="main-sets">

        <artifact-set-card v-if="setAIO"
            :title="(onlineSetting.value ? 'RCB' : 'Lunar') + ' ' +
                    (multistigeSetting.value ? 'Multi set' : 'AIO set')"
            description="Maximizes your Soul Egg gains<br/>with Bird Feeds, Soul Beacons and Tachyons boosts"
            :userData="userData"
            :set="setAIO"
            :stats="[ onlineSetting.value ? 'sercb' : 'seaway' ]"
            :substats="['sercb', 'seaway', 'rcb', 'away', 'ihr']"
            :boosts="[ T.BoostCategory.BIRD_FEED,
                       T.BoostCategory.SOUL_BEACON,
                       T.BoostCategory.TACHYON_PRISM,
                       T.BoostCategory.BOOST_BEACON ]"
            >
            <h3>
                Estimated SE gains
            </h3>
            <span v-for="{ boosts, value } in infoAIO" class="info-entry">
                <img v-for="boost in boosts" :src="getImg(boost)" :alt="boost" :title="getDescription(boost)"/>
                 
                <span class="highlighted">{{ formatNumber(value[0]) }}</span>
                <template v-if="value[1]>1">
                    (<span class="highlighted">{{value[1]}}</span> legs)
                </template>
            </span>
        </artifact-set-card>

        <artifact-set-card v-if="setPreload"
            :title="(onlineSetting.value ? 'RCB' : 'Lunar') + ' ' +
                    (multistigeSetting.value ? 'Piggystige set' : 'Preload set')"
            description="Maximizes your Soul Egg gains<br/>with Bird Feeds and Soul Beacons"
            :userData="userData"
            :set="setPreload"
            :stats="[ onlineSetting.value ? 'sercb' : 'seaway' ]"
            :substats="['sercb', 'seaway', 'rcb', 'away', 'ihr']"
            :boosts="[ T.BoostCategory.BIRD_FEED,
                       T.BoostCategory.SOUL_BEACON,
                       T.BoostCategory.BOOST_BEACON ]"
            >
            <h3>
                Estimated SE gains
            </h3>
            <span v-for="{ boosts, value } in infoPreload" class="info-entry">
                <img v-for="boost in boosts" :src="getImg(boost)" :alt="boost" :title="getDescription(boost)"/>
                 
                <span class="highlighted">{{ formatNumber(value[0]) }}</span>
                <template v-if="value[1]>1">
                    (<span class="highlighted">{{value[1]}}</span> legs)
                </template>
            </span>
        </artifact-set-card>

    </section>
</template>

<style scoped src="@/styles/prestige-set.css"></style>

<script setup lang="ts">
import { ref, shallowRef, computed, watch } from 'vue';
import * as T from '@/scripts/types.ts';
import type { EffectKey } from '@/scripts/effects.ts';
import { parseNumber, formatNumber, spinNumber, formatTime } from '@/scripts/utils.ts';
import { Effects } from '@/scripts/effects.ts';
import { getImg, getDescription } from '@/scripts/boosts.ts';
import { createSetting, createTextInputSetting } from '@/scripts/settings.ts';
import { prepareItems, searchSet } from '@/scripts/solvers.ts';


const DEFAULT_EVENT_EARNINGS = 1;
const DEFAULT_EVENT_PRESTIGE = 1;
const DEFAULT_BUILD_TIME = 85;


const onlineSetting = createSetting<boolean>({
    localStorageKey: 'earning-online',
    defaultValue: true,
});
const multistigeSetting = createSetting<boolean>({
    localStorageKey: 'prestige-multistige',
    defaultValue: false,
});
const reslottingSetting = createSetting<0|1|2|3>({
    localStorageKey: 'prestige-reslotting',
    defaultValue: 0,
});
const buildTimeSetting = createTextInputSetting<number>({
    localStorageKey: 'prestige-build-time',
    defaultValue: DEFAULT_BUILD_TIME,
    parser: (s: string) => {
        const v = s ? parseNumber(s) : DEFAULT_BUILD_TIME;
        if (v < 24 || v > 1511) throw new Error("Build time is out of range");
        return v;
    },
    formatter: formatNumber,
    spinner: (x, inc) => x + inc,
});
const eventEarningsSetting = createTextInputSetting<number>({
    localStorageKey: 'prestige-event-earnings',
    queryParamKey: 'earning_event',
    defaultValue: DEFAULT_EVENT_EARNINGS,
    parser: (s: string) => s ? parseNumber(s) : DEFAULT_EVENT_EARNINGS,
    formatter: formatNumber,
    spinner: (x, inc) => x + inc,
});
const eventPrestigeSetting = createTextInputSetting<number>({
    localStorageKey: 'prestige-event-prestige',
    queryParamKey: 'prestige_event',
    defaultValue: DEFAULT_EVENT_PRESTIGE,
    parser: (s: string) => s ? parseNumber(s) : DEFAULT_EVENT_PRESTIGE,
    formatter: formatNumber,
    spinner: (x, inc) => x + inc,
});
const legCountSetting = createTextInputSetting<number|null>({
    localStorageKey: 'prestige-leg-count',
    defaultValue: null,
    parser: (s: string): number|null => {
        if (s && !/^(?:[1-9]|[1-9][0-9])$/.test(s))
            throw new Error("Invalid input, must be an integer between 1 and 99");
        return s ? parseNumber(s) : null;
    },
    formatter: (x: number|null): string => formatNumber(x ?? legCount.value),
    spinner: (x, inc) => x && inc ? x + inc : null,
});
const swapIHRSetting = createSetting<boolean>({
    localStorageKey: 'prestige-swap-ihr',
    defaultValue: false,
});
const startingPopulationSetting = createTextInputSetting<number|null>({
    localStorageKey: 'prestige-starting-population',
    defaultValue: null,
    parser: (s: string): number|null => {
        if (!s) return null;
        const v = parseNumber(s);
        if (v > 14.175e9) throw new Error("Starting population is out of range");
        return v;
    },
    formatter: (x: number|null): string => formatNumber(x ?? startingPopulation.value),
    spinner: (x, inc) => x && inc ? spinNumber(x, inc) : null,
});




const errorMessage = ref<string>("");

const userData = shallowRef<T.UserData>(); // loaded via load-eid component
const setDili = shallowRef<T.ArtifactSet|null>(null);
const setIHR = shallowRef<T.ArtifactSet|null>(null);
const setPreload = shallowRef<T.ArtifactSet|null>(null);
const setAIO = shallowRef<T.ArtifactSet|null>(null);




const boostTime = computed<number>(() => 600*(setDili.value?.effects.boost_duration_mult ?? 1));
const ihrBonus = computed<number>(() => (setIHR.value?.effects.ihr_mult ?? 1)*(setIHR.value?.effects.boost_mult ?? 1));

const startingPopulation = computed<number>(() => {
    if (startingPopulationSetting.value)
        return startingPopulationSetting.value;
    let ihr = (userData.value?.maxedEffects.ihr ?? 496);
    if (swapIHRSetting.value) ihr *= ihrBonus.value;
    // TODO: better estimation of starting population
    return ihr*1000*100*24;
});

const legCount = computed<number>(() => {
    // best guess of optimal leg count, used for optimizing artifacts
    if (legCountSetting.value)
        return legCountSetting.value;
    const eff = userData.value?.maxedEffects ?? Effects.initial;
    const t = buildTimeSetting.value
    const P = startingPopulation.value;
    const C = (eff.hab_capacity ?? 11.34e9);
    // Use ×1000 tachyon with ×50 boost beacon as baseline
    // For 2bb it may change to 1 less leg
    // For piggystige it may change to 1 or 2 more legs
    const H = (onlineSetting.value ? eff.ihr : eff.ihr_away)*1000*50;

    // earning time that maximizes average SE/s, assuming habs don't get filled up
    const earningT0 =  (0.0172414*(-79*P + 21*H*t + Math.sqrt(6241*P**2 - 882*H*t*P + 441*H**2*t**2)))/H;
    // earning time that maximizes average SE/s, assuming habs gets filled up
    const earningT1 = (21*t*H*C + 50*C*C - 100*C*P + 50*P*P)/(79*C*H);

    // Choose the correct time estimation
    let earningTime = earningT0 < (C-P)/H ? earningT0 : earningT1;

    if (!onlineSetting.value) earningTime = Math.max(60, earningTime);

    return Math.floor((boostTime.value + buildTimeSetting.value)/(earningTime + buildTimeSetting.value));
});





watch([userData, reslottingSetting], updateBaseSets);
watch([userData,
       reslottingSetting,
       onlineSetting,
       multistigeSetting,
       buildTimeSetting,
       startingPopulation,
       legCount,
       boostTime,
      ], updateSets);


function updateBaseSets() {
    console.log("Update dili and IHR sets");

    try {
        errorMessage.value = "";
        const effects: EffectKey[] = [
            'ihr_mult',
            'boost_mult',
            'boost_duration_mult',
        ];
        const { artifacts, stones } = prepareItems(userData.value?.items ?? [],
                                                   (reslottingSetting.value & 2) === 2,
                                                   (reslottingSetting.value & 1) === 1,
                                                   effects);

        // artificially constrains on dummy secondary values to speed up optimization
        // It reduces the amount of equivalent optimal sets, especially with reslotting on
        setDili.value = searchSet(artifacts, stones, userData.value?.proPermit ? 4 : 2,
                              (e) => [ e.boost_duration_mult, e.ihr, e.egg_value_mult ],
                              { userEffects: userData.value?.maxedEffects ?? Effects.initial });
        console.log(`Dili set (${formatTime(boostTime.value)}):`, setDili.value);

        setIHR.value = searchSet(artifacts, stones, userData.value?.proPermit ? 4 : 2,
                              (e) => [ e.ihr*e.boost_mult, e.egg_value_mult ],
                              { userEffects: userData.value?.maxedEffects ?? Effects.initial });
        console.log(`IHR set (×${ihrBonus.value}):`, setIHR.value);

    } catch (e) {
        errorMessage.value = "An error occured.\nTry to clear your browser cache and reload your inventory.\nIf the error persist, contact the developper.\n\n"+(e instanceof Error ? e.message : String(e));
        setDili.value = null;
        setIHR.value = null;
        return;
    }
}

function updateSets() {
    console.log("Update prestige sets");

    try {
        errorMessage.value = "";
        const effects: EffectKey[] = [
            'ihr_mult',
            'ihr_away_mult',
            'hab_capacity_mult',
            'laying_rate',
            'egg_value_mult',
            'earning_mult',
            'earning_mrcb_mult',
            'earning_away_mult',
            'soul_egg_bonus',
            'prophecy_egg_bonus',
            'boost_mult',
            'prestige_earning_mult',
        ];
        const { artifacts, stones } = prepareItems(userData.value?.items ?? [],
                                                   (reslottingSetting.value & 2) == 2,
                                                   (reslottingSetting.value & 1) == 1,
                                                   effects);

        // Assumes starts at maxed population
        setPreload.value = searchSet(artifacts, stones, userData.value?.proPermit ? 4 : 2,
                (e) => [ e.hab_capacity *
                         e.laying_rate *
                         e.egg_value *
                         e.earning_mult *
                         (onlineSetting.value ? e.earning_mrcb_mult : e.earning_away_mult) *
                         e.eb *
                         e.boost_mult**2 *
                         e.prestige_earning_mult ],
                { userEffects: userData.value?.maxedEffects ?? Effects.initial });
        console.log("Preload set:", setPreload.value);

        // Takes 2bb combo as reference
        setAIO.value = searchSet(artifacts, stones, userData.value?.proPermit ? 4 : 2,
                (e) => [ integrateTimeCapacity(startingPopulation.value,
                                               e.hab_capacity,
                                               (onlineSetting.value ? e.ihr : e.ihr_away)*e.boost_mult*1000*100,
                                               multistigeSetting.value ? legCount.value : 1) *
                         e.laying_rate *
                         e.egg_value *
                         e.earning_mult *
                         (onlineSetting.value ? e.earning_mrcb_mult : e.earning_away_mult) *
                         e.eb *
                         e.boost_mult**2 * // counted one more time in the integral when habs are not filled
                         e.prestige_earning_mult ],
                { userEffects: userData.value?.maxedEffects ?? Effects.initial });
        console.log("AIO set:", setAIO.value);

    } catch (e) {
        errorMessage.value = "An error occured.\nTry to clear your browser cache and reload your inventory.\nIf the error persist, contact the developper.\n\n"+(e instanceof Error ? e.message : String(e));
        setPreload.value = null;
        setAIO.value = null;
        return;
    }
}


type Info = {
    boosts: T.Boost[],
    value: [number, number], // SE and leg count
};

const infoPreload = computed<Info[]>(() => {
    const ret: Info[] = [];
    if (!setPreload.value) return ret;

    const eff = new Effects(userData.value?.maxedEffects ?? Effects.initial, setPreload.value.effects);
    eff.set('egg_value_base', 100e12);

    let ihr = (userData.value?.maxedEffects ?? Effects.initial).ihr;
    if (swapIHRSetting.value) ihr *= ihrBonus.value;

    // On multi, counts 24s of boosted IHR. One tachyon and BB is counted here, multiplied later
    // by correct numbers
    const capacity = multistigeSetting.value ?
                        startingPopulationSetting.value ?? ihr*1000*50*24 :
                        eff.hab_capacity;


    ret.push({
        boosts: [
            T.Boost.EARNING_50X10,
            T.Boost.SOUL_500X10,
            T.Boost.BOOST_50X10,
            T.Boost.BOOST_50X10,
            T.Boost.BOOST_50X10,
        ],
        value: calculateGains(eff, capacity*2*3, 50*500*150**2),
    });

    ret.push({
        boosts: [
            T.Boost.EARNING_50X10,
            T.Boost.EARNING_50X10,
            T.Boost.SOUL_500X10,
            T.Boost.BOOST_50X10,
            T.Boost.BOOST_50X10,
        ],
        value: calculateGains(eff, capacity*3*2, 100*500*100**2),
    });

    ret.push({
        boosts: [
            T.Boost.EARNING_50X10,
            T.Boost.EARNING_50X10,
            T.Boost.SOUL_500X10,
            T.Boost.SOUL_500X10,
            T.Boost.BOOST_50X10,
        ],
        value: calculateGains(eff, capacity*4*1, 100*1000*50**2),
    });

    ret.push({
        boosts: [
            T.Boost.EARNING_50X10,
            T.Boost.EARNING_50X10,
            T.Boost.EARNING_50X10,
            T.Boost.SOUL_500X10,
            T.Boost.BOOST_50X10,
        ],
        value: calculateGains(eff, capacity*4*1, 150*500*50**2),
    });

    ret.push({
        boosts: [
            T.Boost.EARNING_50X10,
            T.Boost.EARNING_50X10,
            T.Boost.SOUL_500X10,
            T.Boost.BOOST_10X10,
            T.Boost.BOOST_10X10,
        ],
        value: calculateGains(eff, capacity*3*2, 100*500*20**2),
    });

    return multistigeSetting.value ? ret.slice(0, 1) : ret;
});

const infoAIO = computed<Info[]>(() => {
    const ret: Info[] = [];
    if (!setAIO.value) return ret;

    const eff = new Effects(userData.value?.maxedEffects ?? Effects.initial, setAIO.value.effects);
    eff.set('egg_value_base', 100e12);

    ret.push({
        boosts: [
            T.Boost.TACHYON_1000X10,
            T.Boost.EARNING_50X10,
            T.Boost.SOUL_500X10,
            T.Boost.BOOST_50X10,
            T.Boost.BOOST_50X10,
        ],
        value: calculateGains(eff, multistigeSetting.value ? startingPopulation.value : 0,
                              50*500*100**2, 1000*100),
    });

    ret.push({
        boosts: [
            T.Boost.TACHYON_1000X10,
            T.Boost.EARNING_50X10,
            T.Boost.EARNING_50X10,
            T.Boost.SOUL_500X10,
            T.Boost.BOOST_50X10,
        ],
        value: calculateGains(eff, multistigeSetting.value ? startingPopulation.value : 0,
                              100*500*50**2, 1000*50),
    });

    ret.push({
        boosts: [
            T.Boost.TACHYON_1000X10,
            T.Boost.EARNING_50X10,
            T.Boost.SOUL_500X10,
            T.Boost.BOOST_10X10,
            T.Boost.BOOST_10X10,
        ],
        value: calculateGains(eff, multistigeSetting.value ? startingPopulation.value : 0,
                              50*500*20**2, 1000*20),
    });

    return ret;
});

function calculateGains(e: Effects, startPop: number, earnBoost: number, ihrBoost: number = 1): [number, number] {
    startPop = Math.min(e.hab_capacity, startPop);

    const ihr = (onlineSetting.value ? e.ihr : e.ihr_away)*e.boost_mult*ihrBoost;

    let legs = legCountSetting.value;
    if (!legs) {
        // Estimate optimal leg count for specified ihrBoost
        const t = buildTimeSetting.value
        const P = startingPopulation.value;
        const C = (e.hab_capacity ?? 11.34e9);

        // earning time that maximizes average SE/s, assuming habs don't get filled up
        const earningT0 = (-79*P + 21*ihr*t + Math.sqrt(6241*P**2 - 882*ihr*t*P + 441*ihr**2*t**2))
                          * 0.0172414/ihr;
        // earning time that maximizes average SE/s, assuming habs gets filled up
        const earningT1 = (21*t*ihr*C + 50*C*C - 100*C*P + 50*P*P)/(79*C*ihr);
        let earningTime = earningT0 < (C-P)/ihr ? earningT0 : earningT1;

        if (!onlineSetting.value) earningTime = Math.max(60, earningTime);

        legs = Math.floor((boostTime.value + buildTimeSetting.value)/(earningTime + buildTimeSetting.value));
    }

    let bocks = integrateTimeCapacity(startPop, e.hab_capacity, ihr, multistigeSetting.value ? legs : 1);
    bocks *= e.laying_rate;
    bocks *= e.egg_value;
    bocks *= e.earning_mult;
    bocks *= (onlineSetting.value ? e.earning_mrcb_mult : e.earning_away_mult);
    bocks *= e.eb;
    bocks *= e.boost_mult**2;
    bocks *= e.prestige_earning_mult;
    bocks *= 2*earnBoost*eventEarningsSetting.value; // video doubler, boosts, events

    let gains: number;
    bocks = 1e-6*Math.max(1,bocks);
    if      (bocks < 1e6 ) gains = bocks**.15 - 0.12589254117941673;
    else if (bocks < 1e15) gains = bocks**.16 - 1.302718587495701;
    else if (bocks < 1e24) gains = bocks**.17 - 104.92746467011328;
    else if (bocks < 1e33) gains = bocks**.18 - 8975.244427036363;
    else if (bocks < 1e42) gains = bocks**.19 - 1000098.791133824;
    else if (bocks < 1e54) gains = bocks**.20 - 156689483.33994848;
    else                   gains = bocks**.21 - 155837117430.27557;
    gains *= e.prestige_mult;
    gains *= eventPrestigeSetting.value;

    if (!multistigeSetting.value) return [gains, 1];

    let result = 0;
    for (let i = 0; i < legs; i++) {
        result += gains*((e.soul_eggs + result)/e.soul_eggs)**0.21;
    };
    return [result, legs];
}


function integrateTimeCapacity(startPopulation: number, habCapacity: number, ihr: number, legs: number) {
    // helper for calculating the integral of population through boost time
    // Grows at rate IHR until it reaches habCapacity or boost ends
    // TODO: check for custom legCount/build time if it works well
    const time = (boostTime.value + buildTimeSetting.value)/legs - buildTimeSetting.value;
    const maxPopulation = Math.min(habCapacity - startPopulation, time*ihr);
    return startPopulation*time + (time - maxPopulation/(2*ihr))*maxPopulation;
}

</script>

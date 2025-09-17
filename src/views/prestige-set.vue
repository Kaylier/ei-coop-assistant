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
        <setting-text id="event-duration"
                      v-model="eventDurationSetting"
                      label="Boost dur. event"
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
        <span>
            <span class="highlighted">{{ formatTime(boostTime) }}</span>
            boosts
        </span>
        <span v-if="multistigeSetting.value && swapIHRSetting.value">
            <span class="highlighted">×{{ formatNumber(ihrBonus) }}</span>
            IHR set
        </span>
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
                               earnings during a leg.<br/>
                               Note that boost time is paused when changing eggs."
                      :small="true"
                      inputmode="decimal"/>
        <setting-text v-if="multistigeSetting.value" id="leg-count"
                      v-model="legCountSetting"
                      label="Legs count"
                      tooltip="Amount of legs during multis.<br/>
                               Leave empty for best overall guess."
                      :small="true"
                      inputmode="decimal"/>
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
            <div v-if="multistigeSetting.value && buildTimeSetting.value === DEFAULT_BUILD_TIME" class="warning-text">
                No build time entered
            </div>
            <div v-else v-for="info in infoAIO" class="info-entry">
                <img v-for="boost in info.boosts" :src="getImg(boost)" :alt="boost" :title="getDescription(boost)"/>
                 
                <span class="highlighted">{{ formatNumber(info.gains) }}</span>
                <span tabindex="0" class="tooltip-icon">
                    <span v-if="info.legs > 1">
                        (<span class="highlighted">{{ info.legs }}</span> legs)
                    </span>
                    <span class="tooltip-text">
                        <span class="highlighted">{{ info.legs }}</span>
                        legs of
                        <span class="highlighted">{{ formatTime(info.legTime) }}</span>
                        <br/>
                        Start earning after
                        <span class="highlighted">{{ formatTime(info.buildTime) }}</span>
                        (<span class="highlighted">{{ formatNumber(info.startPop) }}</span> chickens)
                        <br/>
                        Prestige
                        <span class="highlighted">{{ formatTime(info.earningTime) }}</span>
                        later (<span class="highlighted">{{ formatNumber(info.endPop) }}</span> chickens)
                    </span>
                </span>
            </div>
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
            <span v-if="multistigeSetting.value && buildTimeSetting.value === DEFAULT_BUILD_TIME" class="warning-text">
                No build time entered
            </span>
            <span v-else v-for="info in infoPreload" class="info-entry">
                <img v-for="boost in info.boosts" :src="getImg(boost)" :alt="boost" :title="getDescription(boost)"/>
                 
                <span class="highlighted">{{ formatNumber(info.gains) }}</span>
                <span tabindex="0" class="tooltip-icon">
                    <span v-if="info.legs > 1">
                        (<span class="highlighted">{{ info.legs }}</span> legs)
                    </span>
                    <span class="tooltip-text">
                        <span class="highlighted">{{ info.legs }}</span>
                        legs of
                        <span class="highlighted">{{ formatTime(info.legTime) }}</span>
                        <br/>
                        Start earning after
                        <span class="highlighted">{{ formatTime(info.buildTime) }}</span>
                        (<span class="highlighted">{{ formatNumber(info.startPop) }}</span> chickens)
                        <br/>
                        Prestige
                        <span class="highlighted">{{ formatTime(info.earningTime) }}</span>
                        later (<span class="highlighted">{{ formatNumber(info.endPop) }}</span> chickens)
                    </span>
                </span>
            </span>
            <span v-if="multistigeSetting.value && !swapIHRSetting.value" class="warning-text">
                IHR set not used
            </span>
        </artifact-set-card>

    </section>
</template>

<style scoped src="@/styles/prestige-set.css"></style>

<script setup lang="ts">
import { ref, shallowRef, computed, watch } from 'vue';
import * as T from '@/scripts/types.ts';
import { parseNumber, formatNumber, spinNumber, spinBigNumber, formatTime, clamp } from '@/scripts/utils.ts';
import { Effects } from '@/scripts/effects.ts';
import { getImg, getDescription } from '@/scripts/boosts.ts';
import { createSetting, createTextInputSetting } from '@/scripts/settings.ts';
import { prepareItems, searchSet } from '@/scripts/solvers.ts';


const DEFAULT_EVENT_EARNINGS = 1;
const DEFAULT_EVENT_PRESTIGE = 1;
const DEFAULT_EVENT_DURATION = 1;
const DEFAULT_BUILD_TIME = 0;
const DEFAULT_BOOST_IHR = 1000*100;

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
        if (v < 25 || v > 1511) throw new Error("Build time is out of range");
        return v;
    },
    formatter: formatNumber,
    spinner: spinNumber,
});
const eventEarningsSetting = createTextInputSetting<number>({
    localStorageKey: 'prestige-event-earnings',
    queryParamKey: 'earning_event',
    defaultValue: DEFAULT_EVENT_EARNINGS,
    parser: (s: string) => s ? parseNumber(s) : DEFAULT_EVENT_EARNINGS,
    formatter: formatNumber,
    spinner: spinNumber,
});
const eventPrestigeSetting = createTextInputSetting<number>({
    localStorageKey: 'prestige-event-prestige',
    queryParamKey: 'prestige_event',
    defaultValue: DEFAULT_EVENT_PRESTIGE,
    parser: (s: string) => s ? parseNumber(s) : DEFAULT_EVENT_PRESTIGE,
    formatter: formatNumber,
    spinner: spinNumber,
});
const eventDurationSetting = createTextInputSetting<number>({
    localStorageKey: 'prestige-event-duration',
    queryParamKey: 'duration_event',
    defaultValue: DEFAULT_EVENT_DURATION,
    parser: (s: string) => {
        const v = s ? parseNumber(s) : DEFAULT_EVENT_DURATION;
        if (v <= 0 || v > 999) throw new Error("Build time is out of range");
        return v;
    },
    formatter: formatNumber,
    spinner: spinNumber,
});
const legCountSetting = createTextInputSetting<number|null>({
    localStorageKey: 'prestige-leg-count',
    defaultValue: null,
    parser: (s: string): number|null => {
        if (s && !/^(?:[1-9]|[1-9][0-9])$/.test(s))
            throw new Error("Invalid input, must be an integer between 1 and 99");
        return s ? parseNumber(s) : null;
    },
    formatter: (x: number|null): string => x ? formatNumber(x) : 'auto',
    spinner: (x, inc) => x ? x + Math.sign(inc)*(Math.abs(inc)-1) : null,
});
const swapIHRSetting = createSetting<boolean>({
    localStorageKey: 'prestige-swap-ihr',
    defaultValue: false,
});
const startingPopulationSetting = createTextInputSetting<number|null>({
    localStorageKey: 'prestige-starting-population',
    defaultValue: null,
    parser: (s: string) => s ? parseNumber(s) : null,
    formatter: (x: number|null): string => x ? formatNumber(x) : 'auto',
    spinner: (x, inc) => x && inc ? spinBigNumber(x, inc) : null,
});




const errorMessage = ref<string>("");

const userData = shallowRef<T.UserData>(); // loaded via load-eid component
const setDili = shallowRef<T.ArtifactSet|null>(null);
const setIHR = shallowRef<T.ArtifactSet|null>(null);
const setPreload = shallowRef<T.ArtifactSet|null>(null);
const setAIO = shallowRef<T.ArtifactSet|null>(null);



const userEffects = computed(() => (userData.value?.maxedEffects ?? Effects.initial).set('egg_value_base', 100e12));
const boostTime = computed<number>(() => 600*(setDili.value?.effects.boost_duration_mult ?? 1)
                                            *eventDurationSetting.value);
const ihrBonus = computed<number>(() => (setIHR.value?.effects.ihr_mult ?? 1)
                                       *(setIHR.value?.effects.boost_mult ?? 1));

function getStartPopulation(boostIHRBonus: number = DEFAULT_BOOST_IHR) {
    const min = 0;
    const max = userEffects.value.hab_capacity;

    if (startingPopulationSetting.value) {
        return clamp(startingPopulationSetting.value, min, max);
    }

    // estimate the population using ihr_time seconds of IHR
    // Guesstimate based on personal experience
    let ihr_time = 16;
    if (onlineSetting.value && swapIHRSetting.value) ihr_time += 4; // additional time for swapping artifacts
    if (!onlineSetting.value) ihr_time += 9; // additional time for buying vehicles and prestiging

    const ihr = userEffects.value.ihr*(swapIHRSetting.value ? ihrBonus.value : 1);
    return clamp(ihr*boostIHRBonus*ihr_time, min, max);
}

function getLegCount(boostIHRBonus: number = DEFAULT_BOOST_IHR) {
    const min = 1;
    const max = Math.min(Math.floor(boostTime.value/buildTimeSetting.value), 99);

    if (legCountSetting.value) {
        return clamp(legCountSetting.value, min, max);
    }

    const t = buildTimeSetting.value;
    const P = getStartPopulation(boostIHRBonus);
    const C = userEffects.value.hab_capacity;
    const H = (onlineSetting.value ? userEffects.value.ihr : userEffects.value.ihr_away)*boostIHRBonus;

    // earning time that maximizes average SE/s, assuming habs don't get filled up
    const earningT0 = (-79*P + 21*H*t + Math.sqrt(6241*P**2 - 882*H*t*P + 441*H**2*t**2))/H/58;
    // earning time that maximizes average SE/s, assuming habs gets filled up
    const earningT1 = (21*t*H*C + 50*C*C - 100*C*P + 50*P*P)/(79*C*H);

    // Choose the correct time estimation
    // The curves intersect T = (C-P)/H, so we can just take the min
    let earningTime = Math.min(earningT0, earningT1);

    if (!onlineSetting.value) {
        earningTime = Math.max(60, earningTime);
    }

    const legCount = Math.floor((boostTime.value + buildTimeSetting.value)/(earningTime + buildTimeSetting.value));
    return clamp(legCount, min, max);
}





watch([userData, reslottingSetting], updateBaseSets);
watch([userData,
       reslottingSetting,
       onlineSetting,
       multistigeSetting,
       buildTimeSetting,
       swapIHRSetting,
       boostTime,
       ihrBonus,
      ], updateSets);


function updateBaseSets() {
    console.log("Update dili and IHR sets");

    try {
        errorMessage.value = "";
        const { artifacts, stones } = prepareItems(userData.value?.items ?? [], false, false, [
            'ihr_base',
            'ihr_mult',
            'boost_mult',
            'boost_duration_mult',
        ], [
            'drone_frequency_mult',
        ]);

        setDili.value = searchSet(artifacts, stones, userData.value?.proPermit ? 4 : 2,
                              (e) => [ e.boost_duration_mult, e.drone_frequency_mult, e.ihr ],
                              { userEffects: userEffects.value });
        console.log(`Dili set (${formatTime(boostTime.value)}):`, setDili.value);

        setIHR.value = searchSet(artifacts, stones, userData.value?.proPermit ? 4 : 2,
                              (e) => [ e.ihr*e.boost_mult, e.drone_frequency_mult ],
                              { userEffects: userEffects.value });
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
        const { artifacts, stones } = prepareItems(userData.value?.items ?? [],
                                                   (reslottingSetting.value & 2) == 2,
                                                   (reslottingSetting.value & 1) == 1, [
            'ihr_base',
            'ihr_mult',
            'ihr_away_mult',
            'hab_capacity_mult',
            'laying_rate',
            'egg_value_base',
            'egg_value_mult',
            'earning_mult',
            'earning_mrcb_mult',
            'earning_away_mult',
            'soul_eggs',
            'prophecy_eggs',
            'soul_egg_bonus',
            'prophecy_egg_bonus',
            'prestige_earning_mult',
            'prestige_mult',
            'boost_mult',
        ], [
        ]);

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
                { userEffects: userEffects.value });
        console.log("Preload set:", setPreload.value);

        // Takes 2bb combo as reference
        setAIO.value = searchSet(artifacts, stones, userData.value?.proPermit ? 4 : 2,
                (e) => [ integrateTimeCapacity(getStartPopulation(),
                                               e.hab_capacity,
                                               (onlineSetting.value ? e.ihr : e.ihr_away)*e.boost_mult*DEFAULT_BOOST_IHR,
                                               multistigeSetting.value ? getLegCount() : 1) *
                         e.laying_rate *
                         e.egg_value *
                         e.earning_mult *
                         (onlineSetting.value ? e.earning_mrcb_mult : e.earning_away_mult) *
                         e.eb *
                         e.boost_mult**2 * // counted one more time in the integral when habs are not filled
                         e.prestige_earning_mult ],
                { userEffects: userEffects.value });
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
    gains: number,
    legs: number,
    legTime: number,
    buildTime: number,
    earningTime: number,
    startPop: number,
    endPop: number,
};

const infoPreload = computed<Info[]>(() => {
    const ret: Info[] = [];
    if (!setPreload.value) return ret;

    const eff = new Effects(userEffects.value, setPreload.value.effects);
    eff.set('egg_value_base', 100e12);

    const multi: boolean = multistigeSetting.value;

    ret.push({
        boosts: [
            T.Boost.EARNING_50X10,
            T.Boost.SOUL_500X10,
            T.Boost.BOOST_50X10,
            T.Boost.BOOST_50X10,
            T.Boost.BOOST_50X10,
        ],
        ...calculateGains(eff, multi ? getStartPopulation(2000*150) : eff.hab_capacity, 50*500*150**2),
    });

    ret.push({
        boosts: [
            T.Boost.EARNING_50X10,
            T.Boost.EARNING_50X10,
            T.Boost.SOUL_500X10,
            T.Boost.BOOST_50X10,
            T.Boost.BOOST_50X10,
        ],
        ...calculateGains(eff, multi ? getStartPopulation(3000*100) : eff.hab_capacity, 100*500*100**2),
    });

    ret.push({
        boosts: [
            T.Boost.EARNING_50X10,
            T.Boost.EARNING_50X10,
            T.Boost.SOUL_500X10,
            T.Boost.SOUL_500X10,
            T.Boost.BOOST_50X10,
        ],
        ...calculateGains(eff, multi ? getStartPopulation(4000*50) : eff.hab_capacity, 100*1000*50**2),
    });

    ret.push({
        boosts: [
            T.Boost.EARNING_50X10,
            T.Boost.EARNING_50X10,
            T.Boost.EARNING_50X10,
            T.Boost.SOUL_500X10,
            T.Boost.BOOST_50X10,
        ],
        ...calculateGains(eff, multi ? getStartPopulation(4000*50) : eff.hab_capacity, 150*500*50**2),
    });

    ret.push({
        boosts: [
            T.Boost.EARNING_50X10,
            T.Boost.EARNING_50X10,
            T.Boost.SOUL_500X10,
            T.Boost.BOOST_10X10,
            T.Boost.BOOST_10X10,
        ],
        ...calculateGains(eff, multi ? getStartPopulation(3000*100) : eff.hab_capacity, 100*500*20**2),
    });

    return multistigeSetting.value ? ret.slice(0, 1) : ret;
});

const infoAIO = computed<Info[]>(() => {
    const ret: Info[] = [];
    if (!setAIO.value) return ret;

    const eff = new Effects(userEffects.value, setAIO.value.effects);
    eff.set('egg_value_base', 100e12);

    const multi: boolean = multistigeSetting.value;

    ret.push({
        boosts: [
            T.Boost.TACHYON_1000X10,
            T.Boost.EARNING_50X10,
            T.Boost.SOUL_500X10,
            T.Boost.BOOST_50X10,
            T.Boost.BOOST_50X10,
        ],
        ...calculateGains(eff, multi ? getStartPopulation(1000*100) : 0, 50*500*100**2, 1000*100),
    });

    ret.push({
        boosts: [
            T.Boost.TACHYON_1000X10,
            T.Boost.EARNING_50X10,
            T.Boost.EARNING_50X10,
            T.Boost.SOUL_500X10,
            T.Boost.BOOST_50X10,
        ],
        ...calculateGains(eff, multi ? getStartPopulation(1000*50) : 0, 100*500*50**2, 1000*50),
    });

    ret.push({
        boosts: [
            T.Boost.TACHYON_1000X10,
            T.Boost.EARNING_50X10,
            T.Boost.SOUL_500X10,
            T.Boost.BOOST_10X10,
            T.Boost.BOOST_10X10,
        ],
        ...calculateGains(eff, multi ? getStartPopulation(1000*20) : 0, 50*500*20**2, 1000*20),
    });

    return ret;
});

function calculateGains(e: Effects, startPop: number, earnBoost: number, ihrBoost: number = 1) {
    startPop = Math.min(e.hab_capacity, startPop);

    const ihr = (onlineSetting.value ? e.ihr : e.ihr_away)*e.boost_mult*ihrBoost;

    const legs = multistigeSetting.value ? getLegCount(ihrBoost) : 1;

    let bocks = integrateTimeCapacity(startPop, e.hab_capacity, ihr, legs);
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

    let result = 0;
    for (let i = 0; i < legs; i++) {
        result += gains*(1 + result/e.soul_eggs)**0.21;
    };

    const buildTime = buildTimeSetting.value;
    const legTime = (boostTime.value + buildTimeSetting.value)/legs;
    const earningTime = legTime - buildTimeSetting.value;
    const endPop = Math.min(e.hab_capacity, startPop + earningTime*ihr);
    return {
        gains: result,
        legs,
        legTime,
        buildTime,
        earningTime,
        startPop,
        endPop,
    };
}


function integrateTimeCapacity(startPopulation: number, habCapacity: number, ihr: number, legs: number) {
    // helper for calculating the integral of population through boost time
    // Grows at rate IHR until it reaches habCapacity or boost ends
    const time = (boostTime.value + buildTimeSetting.value)/legs - buildTimeSetting.value;
    const maxPopulation = Math.min(habCapacity - startPopulation, time*ihr);
    return startPopulation*time + (time - maxPopulation/(2*ihr))*maxPopulation;
}

</script>

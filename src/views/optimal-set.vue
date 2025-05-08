<template>
    <load-eid v-model="userData"/>

    <section class="settings">
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
        <setting-text id="build-time"
                      v-model="buildTimeSetting"
                      label="Build time (seconds)"
                      tooltip="Time not producing money during multis in seconds.<br/>
                               Enter the non-piggystige time, extra time<br/>
                               is already added for piggystige calculations."/>
        <setting-text id="starting-population"
                      v-model="startingPopulationSetting"
                      label="Starting population"
                      tooltip="Population when earnings start to kick off during multis.<br/>
                               Ignored for piggystiges, uses 10.8B instead."/>
    </section>

    <pre v-if="errorMessage" class="invalid-text" style="white-space:preserve">{{ errorMessage }}</pre>

    <section v-if="!errorMessage && userData" id="main-sets">

        <template v-for="entry of sets">
            <artifact-set-card v-if="entry.solution" :key="entry.solution"
                :title="entry.title"
                :description="entry.description"
                :set="entry.solution"
                :userData="userData"
                :boosts="entry.boosts"
                >
            <span v-if="entry.extra" v-for="{ value, text } in entry.extra">
                <span class="highlighted">{{ value ?? "unknown" }}</span>
                {{ text }}
            </span>
            </artifact-set-card>
        </template>

    </section>
</template>

<style scoped>
#main-sets {
    display: flex;
    flex-flow: row wrap;
    align-content: flex-start;
    align-items: flex-start;
    gap: 2em;
    text-align: center;
}
.highlighted {
    color: color-mix(in srgb, var(--active-color) 75%, white);
    font-kerning: none;
}
</style>

<script setup lang="ts">
import { ref, shallowRef, triggerRef, watch } from 'vue';
import * as T from '@/scripts/types.ts';
import type { EffectKey } from '@/scripts/effects.ts';
import { parseNumber, formatNumber } from '@/scripts/utils.ts';
import { Effects } from '@/scripts/effects.ts';
import { createSetting, createTextInputSetting } from '@/scripts/settings.ts';
import { prepareItems, searchSet } from '@/scripts/solvers.ts';


type SetEntry = {
    title: string,
    description?: string,
    solution?: T.ArtifactSet|null,
    effects: EffectKey[],
    scoreFn: (effect: Effects) => number[],
    boosts?: T.BoostCategory[],
    extra?:  { fn: (effect: Effects) => number, value?: string|number, text: string }[],
};

const reslottingSetting = createSetting<boolean>({
    localStorageKey: 'optimal-reslotting',
    defaultValue: false,
});
const buildTimeSetting = createTextInputSetting<number>({
    //localStorageKey: 'prestige-build-time',
    //queryParamKey: 'build_time',
    defaultValue: 85,
    parser: (s: string) => s ? parseNumber(s) : 85,
    formatter: formatNumber,
});
const startingPopulationSetting = createTextInputSetting<number>({
    //localStorageKey: 'prestige-starting-population',
    //queryParamKey: 'starting_population',
    defaultValue: 1.2e9,
    parser: (s: string) => s ? parseNumber(s) : 1.2e9,
    formatter: formatNumber,
});

const errorMessage = ref<string>("");

const userData = shallowRef<T.UserData>(); // loaded via load-eid component
const sets = shallowRef<SetEntry[]>([
    {
        title: "Preloaded RCB Prestige",
        effects: [
            'prophecy_egg_bonus',
            'boost_mult',
            'laying_rate',
            'prestige_earning_mult',
            'hab_capacity_mult',
            'egg_value_mult',
            'earning_mrcb_mult',
            'soul_egg_bonus',
        ],
        scoreFn: (e) => {
            let score = 1;
            score *= e.hab_capacity_mult;
            score *= e.laying_rate;
            score *= e.egg_value_mult;
            score *= e.earning_mult;
            score *= e.earning_mrcb_mult;
            score *= e.eb;
            score *= e.boost_mult**2;
            score *= e.prestige_earning_mult;
            return [ score ];
        },
        boosts: [
            T.BoostCategory.BIRD_FEED,
            T.BoostCategory.SOUL_BEACON,
            T.BoostCategory.BOOST_BEACON,
        ],
        extra: [{
            fn: (e) => {
                let score = 1;
                score *= e.hab_capacity;
                score *= e.laying_rate;
                score *= e.egg_value;
                score *= e.earning_mult;
                score *= e.earning_mrcb_mult;
                score *= e.eb;
                score *= e.boost_mult**2;
                score *= e.prestige_earning_mult;
                score *= 2; // video doubler
                score *= 50*500*150**2; // boosts
                score *= 60*10*1.08**12; // time
                return (Math.pow(score*1e-6, 0.21) - 155837117430.27557)*e.prestige_mult;
            },
            text: "est. SE gains (best boosts)",
        }],
    },
    {
        title: "AIO RCB Prestige",
        effects: [
            'prophecy_egg_bonus',
            'boost_mult',
            'laying_rate',
            'prestige_earning_mult',
            'ihr_mult',
            'egg_value_mult',
            'earning_mrcb_mult',
            'soul_egg_bonus',
        ],
        scoreFn: (e) => {
            let score = 1;
            score *= e.ihr_mult;
            score *= e.laying_rate;
            score *= e.egg_value_mult;
            score *= e.earning_mult;
            score *= e.earning_mrcb_mult;
            score *= e.eb;
            score *= e.boost_mult**3;
            score *= e.prestige_earning_mult;
            return [ score ];
        },
        boosts: [
            T.BoostCategory.BIRD_FEED,
            T.BoostCategory.SOUL_BEACON,
            T.BoostCategory.TACHYON_PRISM,
            T.BoostCategory.BOOST_BEACON,
        ],
        extra: [{
            fn: (e) => {
                let score = 1;
                score *= e.hab_capacity;
                score *= e.laying_rate;
                score *= e.egg_value;
                score *= e.earning_mult;
                score *= e.earning_mrcb_mult;
                score *= e.eb;
                score *= e.boost_mult**2;
                score *= e.prestige_earning_mult;
                score *= 2; // video doubler
                score *= 50*500*100**2; // boosts
                score *= 60*10*1.08**12 - 228/2; // time
                return (Math.pow(score*1e-6, 0.21) - 155837117430.27557)*e.prestige_mult;
            },
            text: "est. SE gains (best boosts)",
        }],
    },
    {
        title: "Multi RCB Prestige",
        effects: [
            'prophecy_egg_bonus',
            'boost_mult',
            'laying_rate',
            'prestige_earning_mult',
            'ihr_mult',
            'egg_value_mult',
            'earning_mrcb_mult',
            'soul_egg_bonus',
        ],
        scoreFn: (e) => {
            let score = 1;
            score *= e.ihr_mult;
            score *= e.laying_rate;
            score *= e.egg_value_mult;
            score *= e.earning_mult;
            score *= e.earning_mrcb_mult;
            score *= e.eb;
            score *= e.boost_mult**3;
            score *= e.prestige_earning_mult;
            return [ score ];
        },
        boosts: [
            T.BoostCategory.BIRD_FEED,
            T.BoostCategory.SOUL_BEACON,
            T.BoostCategory.TACHYON_PRISM,
            T.BoostCategory.BOOST_BEACON,
        ],
        extra: [{
            fn: (e) => {
                const P = startingPopulationSetting.value;
                const t = buildTimeSetting.value;
                const ihrTime = (0.0172414*(-79*P + 21*e.ihr*t + Math.sqrt(6241*P**2 - 882*e.ihr*t*P + 441*e.ihr**2*t**2)))/e.ihr;
                return Math.floor((60*10*1.08**12 + t)/(ihrTime + t));
            },
            text: "legs",
        }, {
            fn: (e) => {
                const P = startingPopulationSetting.value;
                const t = buildTimeSetting.value;
                let ihrTime = (0.0172414*(-79*P + 21*e.ihr*t + Math.sqrt(6241*P**2 - 882*e.ihr*t*P + 441*e.ihr**2*t**2)))/e.ihr;
                const legs = Math.floor((60*10*1.08**12 + t)/(ihrTime + t));
                ihrTime = (60*10*1.08**12 + buildTimeSetting.value)/legs - t;
                let score = startingPopulationSetting.value;
                score += e.ihr*ihrTime/2*1000*100*e.boost_mult; // population and boosts
                if (score > e.hab_capacity) {
                    score = startingPopulationSetting.value;
                    const fillTime = (e.hab_capacity - score)/(e.ihr*1000*100*e.boost_mult);
                    score += (e.hab_capacity - startingPopulationSetting.value)*(ihrTime - fillTime/2);
                }

                score *= e.laying_rate;
                score *= e.egg_value;
                score *= e.earning_mult;
                score *= e.earning_mrcb_mult;
                score *= e.eb;
                score *= e.boost_mult**2;
                score *= e.prestige_earning_mult;
                score *= 2; // video doubler
                score *= 50*500*100**2; // boosts
                score *= ihrTime;
                score = Math.pow(score*1e-6, 0.21)*e.prestige_mult;

                let result = 0;
                for (let i = 0; i < legs; i++) {
                    result += score*((e.soul_eggs + result + score)/e.soul_eggs)**0.21;
                };
                return result;
            },
            text: "est. SE gains (best boosts)",
        }, {
            fn: (e) => {
                const P = 10.8e9;
                const t = buildTimeSetting.value + 9; // 9s lost to piggy variant, based on soulreaper video
                let earnTime = (0.0172414*(-79*P + 21*e.ihr*t + Math.sqrt(6241*P**2 - 882*e.ihr*t*P + 441*e.ihr**2*t**2)))/e.ihr;
                const legs = Math.floor((60*10*1.08**12 + t)/(earnTime + t));
                earnTime = (60*10*1.08**12 + buildTimeSetting.value)/legs - t;
                let score = 10e9;
                score *= e.laying_rate;
                score *= e.egg_value;
                score *= e.earning_mult;
                score *= e.earning_mrcb_mult;
                score *= e.eb;
                score *= e.boost_mult**2;
                score *= e.prestige_earning_mult;
                score *= 2; // video doubler
                score *= 50*500*150**2; // boosts
                score *= earnTime;
                score = Math.pow(score*1e-6, 0.21)*e.prestige_mult;

                let result = 0;
                for (let i = 0; i < legs; i++) {
                    result += score*((e.soul_eggs + result + score)/e.soul_eggs)**0.21;
                };
                return result;
            },
            text: "est. SE gains (piggystige) ⚠",
        }],
    },
    {
        title: "Preloaded Lunar Prestige",
        effects: [
            'prophecy_egg_bonus',
            'boost_mult',
            'laying_rate',
            'prestige_earning_mult',
            'hab_capacity_mult',
            'egg_value_mult',
            'earning_away_mult',
            'soul_egg_bonus',
        ],
        scoreFn: (e) => {
            let score = 1;
            score *= e.hab_capacity_mult;
            score *= e.laying_rate;
            score *= e.egg_value_mult;
            score *= e.earning_mult;
            score *= e.earning_away_mult;
            score *= e.eb;
            score *= e.boost_mult**2;
            score *= e.prestige_earning_mult;
            return [ score ];
        },
        boosts: [
            T.BoostCategory.BIRD_FEED,
            T.BoostCategory.SOUL_BEACON,
            T.BoostCategory.BOOST_BEACON,
        ],
        extra: [{
            fn: (e) => {
                let score = 1;
                score *= e.hab_capacity;
                score *= e.laying_rate;
                score *= e.egg_value;
                score *= e.earning_mult;
                score *= e.earning_away_mult;
                score *= e.eb;
                score *= e.boost_mult**2;
                score *= e.prestige_earning_mult;
                score *= 2; // video doubler
                score *= 50*500*150**2; // boosts
                score *= 60*10*1.08**12; // time
                return (Math.pow(score*1e-6, 0.21) - 155837117430.27557)*e.prestige_mult;
            },
            text: "est. SE gains (best boosts)",
        }],
    },
    {
        title: "AIO Lunar Prestige",
        effects: [
            'prophecy_egg_bonus',
            'boost_mult',
            'laying_rate',
            'prestige_earning_mult',
            'ihr_mult',
            'hab_capacity_mult',
            'egg_value_mult',
            'earning_away_mult',
            'soul_egg_bonus',
        ],
        scoreFn: (e) => {
            let score = 1;
            //score *= e.ihr_mult; // only counted the first couple minutes, we ignore it
            //score *= e.ihr_away_mult; // only counted the first couple minutes, we ignore it
            score *= e.hab_capacity_mult;
            score *= e.laying_rate;
            score *= e.egg_value_mult;
            score *= e.earning_mult;
            score *= e.earning_away_mult;
            score *= e.eb;
            score *= e.boost_mult**2;
            score *= e.prestige_earning_mult;
            return [ score ];
        },
        boosts: [
            T.BoostCategory.BIRD_FEED,
            T.BoostCategory.SOUL_BEACON,
            T.BoostCategory.TACHYON_PRISM,
            T.BoostCategory.BOOST_BEACON,
        ],
        extra: [{
            fn: (e) => {
                let score = 1;
                score *= e.hab_capacity;
                score *= e.laying_rate;
                score *= e.egg_value;
                score *= e.earning_mult;
                score *= e.earning_away_mult;
                score *= e.eb;
                score *= e.boost_mult**2;
                score *= e.prestige_earning_mult;
                score *= 2; // video doubler
                score *= 50*500*100**2; // boosts
                score *= 60*10*1.08**12 - 76/2; // time
                return (Math.pow(score*1e-6, 0.21) - 155837117430.27557)*e.prestige_mult;
            },
            text: "est. SE gains (best boosts)",
        }],
    },
    {
        title: "Multi Lunar Prestige",
        effects: [
            'prophecy_egg_bonus',
            'boost_mult',
            'laying_rate',
            'prestige_earning_mult',
            'ihr_mult',
            'egg_value_mult',
            'earning_away_mult',
            'soul_egg_bonus',
        ],
        scoreFn: (e) => {
            let score = 1;
            score *= e.ihr_mult;
            score *= e.ihr_away_mult;
            score *= e.laying_rate;
            score *= e.egg_value_mult;
            score *= e.earning_mult;
            score *= e.earning_away_mult;
            score *= e.eb;
            score *= e.boost_mult**3;
            score *= e.prestige_earning_mult;
            return [ score ];
        },
        boosts: [
            T.BoostCategory.BIRD_FEED,
            T.BoostCategory.SOUL_BEACON,
            T.BoostCategory.TACHYON_PRISM,
            T.BoostCategory.BOOST_BEACON,
        ],
        extra: [{
            fn: () => {
                return Math.floor((60*10*1.08**12 + buildTimeSetting.value)/(60 + buildTimeSetting.value));
            },
            text: "legs",
        }, {
            fn: (e) => {
                const legs = Math.floor((60*10*1.08**12 + buildTimeSetting.value)/(60 + buildTimeSetting.value));
                const ihrTime = (60*10*1.08**12 + buildTimeSetting.value)/legs - buildTimeSetting.value;
                let score = startingPopulationSetting.value;
                score += e.ihr_away*ihrTime/2*1000*100*e.boost_mult; // population and boosts
                if (score > e.hab_capacity) {
                    score = startingPopulationSetting.value;
                    const fillTime = (e.hab_capacity - score)/(e.ihr_away*1000*100*e.boost_mult);
                    score += (e.hab_capacity - startingPopulationSetting.value)*(ihrTime - fillTime/2);
                }

                score *= e.laying_rate;
                score *= e.egg_value;
                score *= e.earning_mult;
                score *= e.earning_away_mult;
                score *= e.eb;
                score *= e.boost_mult**2;
                score *= e.prestige_earning_mult;
                score *= 2; // video doubler
                score *= 50*500*100**2; // boosts
                score *= ihrTime;
                score = Math.pow(score*1e-6, 0.21)*e.prestige_mult;

                let result = 0;
                for (let i = 0; i < legs; i++) {
                    result += score*((e.soul_eggs + result + score)/e.soul_eggs)**0.21;
                };
                return result;
            },
            text: "est. SE gains (best boosts)",
        }, {
            fn: (e) => {
                const t = buildTimeSetting.value + 13; // 13s lost to piggy variant, based on Jack video
                const legs = Math.floor((60*10*1.08**12 + t)/(60 + t));
                const earnTime = (60*10*1.08**12 + t)/legs - t;
                let score = 10.8e9;
                score *= e.laying_rate;
                score *= e.egg_value;
                score *= e.earning_mult;
                score *= e.earning_away_mult;
                score *= e.eb;
                score *= e.boost_mult**2;
                score *= e.prestige_earning_mult;
                score *= 2; // video doubler
                score *= 50*500*150**2; // boosts
                score *= earnTime;
                score = Math.pow(score*1e-6, 0.21)*e.prestige_mult;

                let result = 0;
                for (let i = 0; i < legs; i++) {
                    result += score*((e.soul_eggs + result + score)/e.soul_eggs)**0.21;
                };
                return result;
            },
            text: "est. SE gains (piggystige) ⚠",
        }],
    },
    {
        title: "Dilithium",
        effects: ['boost_duration_mult'],
        scoreFn: (e) => [ e.boost_duration_mult ],
    },
    {
        title: "IHR",
        effects: ['ihr_mult', 'boost_mult', 'hab_capacity_mult'],
        scoreFn: (e) => [ e.ihr_mult*e.boost_mult, e.hab_capacity_mult ],
        boosts: [ T.BoostCategory.TACHYON_PRISM ],
    },
    {
        title: "EB",
        effects: ['prophecy_egg_bonus', 'soul_egg_bonus'],
        scoreFn: (e) => [ e.eb ],
    },
    {
        title: "Refueling",
        effects: [
            'laying_rate',
            'boost_mult',
            'ihr_mult',
        ],
        scoreFn: (e) => {
            let score = 1;
            score *= e.ihr_mult;
            score *= e.laying_rate;
            score *= e.boost_mult;
            return [ score ];
        },
        boosts: [ T.BoostCategory.TACHYON_PRISM ],
    },
    {
        title: "Drone (GE)",
        effects: ['drone_gold_mult', 'drone_frequency_mult', 'drone_reward_mult'],
        scoreFn: (e) => [ Math.min(1, 0.3*e.drone_gold_mult)*
                          e.drone_frequency_mult*
                          e.drone_reward_mult ],
    },
    {
        title: "Drone (Cash)",
        effects: ['drone_cash_mult', 'drone_frequency_mult', 'drone_reward_mult', 'earning_mrcb_mult',
        'farm_value_mult'],
        scoreFn: (e) => [ Math.min(1, 0.7*e.drone_cash_mult)*
                          e.drone_frequency_mult*
                          e.drone_reward_mult*
                          Math.sqrt(e.earning_mrcb_mult)*
                          e.farm_value_mult ],
    },
]);


watch([userData, reslottingSetting], updateSets);
watch([buildTimeSetting, startingPopulationSetting], updateExtra);


function updateSets() {
    for (const entry of sets.value) {
        updateSet(entry);
    }
    updateExtra();
    triggerRef(sets);
}

function updateExtra() {
    for (const entry of sets.value) {
        if (!entry.solution) continue;
        if (!entry.extra) continue;

        const eff = new Effects(userData.value?.maxedEffects ?? Effects.initial, entry.solution.effects);
        eff.set('egg_value_base', 100e12);

        for (const extraEntry of entry.extra) {
            extraEntry.value = formatNumber(extraEntry.fn(eff));
        }
    }
    triggerRef(sets);
}

function updateSet(setEntry: SetEntry) {
    console.log("Solve set", setEntry.title);

    try {
        errorMessage.value = "";
        const { artifacts, stones } = prepareItems(userData.value?.items ?? [],
                                                   reslottingSetting.value,
                                                   reslottingSetting.value,
                                                   setEntry.effects);
        setEntry.solution = searchSet(artifacts, stones,
                                      userData.value?.proPermit ? 4 : 2,
                                      setEntry.scoreFn,
                                      { userEffects: userData.value?.maxedEffects });
        console.log(setEntry.title, setEntry.solution);

    } catch (e) {
        errorMessage.value = "An error occured.\nTry to clear your browser cache and reload your inventory.\nIf the error persist, contact the developper.\n\n"+(e instanceof Error ? e.message : String(e));
        setEntry.solution = null;
        return;
    }
}


</script>

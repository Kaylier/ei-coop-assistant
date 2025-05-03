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
    </section>

    <pre v-if="errorMessage" class="invalid-text" style="white-space:preserve">{{ errorMessage }}</pre>

    <section v-if="!errorMessage && userData" id="main-sets">

        <template v-for="entry of sets">
            <artifact-set-card v-if="entry.solution" :key="entry.solution"
                :title="entry.title"
                :description="entry.description"
                :set="entry.solution"
                :userData="userData"
                />
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
</style>

<script setup lang="ts">
import { ref, shallowRef, triggerRef, watch } from 'vue';
import * as T from '@/scripts/types.ts';
import type { EffectKey } from '@/scripts/effects.ts';
import { Effects } from '@/scripts/effects.ts';
import { createSetting } from '@/scripts/settings.ts';
import { prepareItems, searchSet } from '@/scripts/solvers.ts';


type SetEntry = {
    title: string,
    description?: string,
    solution?: T.ArtifactSet|null,
    effects: EffectKey[],
    scoreFn: (effect: Effects) => number[];
};

const reslottingSetting = createSetting<boolean>({
    localStorageKey: 'optimal-reslotting',
    defaultValue: false,
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
            score *= e.get('hab_capacity_mult');
            score *= e.get('laying_rate');
            score *= e.get('egg_value_mult');
            score *= (userData.value?.mrcbEarningBonus ?? 340) + e.get('earning_mrcb_mult');
            score *= (userData.value?.soulEggBonus ?? 0) + e.get('soul_egg_bonus');
            score *= Math.pow((userData.value?.prophecyEggBonus ?? 1.05) + e.get('prophecy_egg_bonus'),
                              userData.value?.prophecyEggs ?? 0);
            score *= e.get('boost_mult')**2;
            score *= e.get('prestige_earning_mult');
            return [ score ];
        },
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
            score *= e.get('ihr_mult');
            score *= e.get('laying_rate');
            score *= e.get('egg_value_mult');
            score *= (userData.value?.mrcbEarningBonus ?? 340) + e.get('earning_mrcb_mult');
            score *= (userData.value?.soulEggBonus ?? 0) + e.get('soul_egg_bonus');
            score *= Math.pow((userData.value?.prophecyEggBonus ?? 1.05) + e.get('prophecy_egg_bonus'),
                              userData.value?.prophecyEggs ?? 0);
            score *= e.get('boost_mult')**3;
            score *= e.get('prestige_earning_mult');
            return [ score ];
        },
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
            score *= e.get('ihr_mult');
            score *= e.get('laying_rate');
            score *= e.get('egg_value_mult');
            score *= (userData.value?.mrcbEarningBonus ?? 340) + e.get('earning_mrcb_mult');
            score *= (userData.value?.soulEggBonus ?? 0) + e.get('soul_egg_bonus');
            score *= Math.pow((userData.value?.prophecyEggBonus ?? 1.05) + e.get('prophecy_egg_bonus'),
                              userData.value?.prophecyEggs ?? 0);
            score *= e.get('boost_mult')**3;
            score *= e.get('prestige_earning_mult');
            return [ score ];
        },
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
            score *= e.get('hab_capacity_mult');
            score *= e.get('laying_rate');
            score *= e.get('egg_value_mult');
            score *= e.get('earning_away_mult');
            score *= (userData.value?.soulEggBonus ?? 0) + e.get('soul_egg_bonus');
            score *= Math.pow((userData.value?.prophecyEggBonus ?? 1.05) + e.get('prophecy_egg_bonus'),
                              userData.value?.prophecyEggs ?? 0);
            score *= e.get('boost_mult')**2;
            score *= e.get('prestige_earning_mult');
            return [ score ];
        },
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
            //score *= e.get('ihr_mult'); // only counted the first couple minutes, we ignore it
            score *= e.get('hab_capacity_mult');
            score *= e.get('laying_rate');
            score *= e.get('egg_value_mult');
            score *= e.get('earning_away_mult');
            score *= (userData.value?.soulEggBonus ?? 0) + e.get('soul_egg_bonus');
            score *= Math.pow((userData.value?.prophecyEggBonus ?? 1.05) + e.get('prophecy_egg_bonus'),
                              userData.value?.prophecyEggs ?? 0);
            score *= e.get('boost_mult')**2;
            score *= e.get('prestige_earning_mult');
            return [ score ];
        },
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
            score *= e.get('ihr_mult');
            score *= e.get('laying_rate');
            score *= e.get('egg_value_mult');
            score *= e.get('earning_away_mult');
            score *= (userData.value?.soulEggBonus ?? 0) + e.get('soul_egg_bonus');
            score *= Math.pow((userData.value?.prophecyEggBonus ?? 1.05) + e.get('prophecy_egg_bonus'),
                              userData.value?.prophecyEggs ?? 0);
            score *= e.get('boost_mult')**3;
            score *= e.get('prestige_earning_mult');
            return [ score ];
        },
    },
    {
        title: "Dilithium",
        effects: ['boost_duration_mult'],
        scoreFn: (e) => [ e.get('boost_duration_mult') ],
    },
    {
        title: "IHR",
        effects: ['ihr_mult', 'boost_mult', 'hab_capacity_mult'],
        scoreFn: (e) => [ e.get('ihr_mult')*e.get('boost_mult'), e.get('hab_capacity_mult') ],
    },
    {
        title: "EB",
        effects: ['prophecy_egg_bonus', 'soul_egg_bonus'],
        scoreFn: (e) => [ ((userData.value?.soulEggBonus ?? 0) + e.get('soul_egg_bonus'))*
                          Math.pow((userData.value?.prophecyEggBonus ?? 1.05) + e.get('prophecy_egg_bonus'),
                          userData.value?.prophecyEggs ?? 0) ],
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
            score *= e.get('ihr_mult');
            score *= e.get('laying_rate');
            score *= e.get('boost_mult');
            return [ score ];
        },
    },
    {
        title: "Drone (GE)",
        effects: ['drone_gold_mult', 'drone_frequency_mult', 'drone_reward_mult'],
        scoreFn: (e) => [ Math.min(1, 0.3*e.get('drone_gold_mult'))*
                          e.get('drone_frequency_mult')*
                          e.get('drone_reward_mult') ],
    },
    {
        title: "Drone (Cash)",
        effects: ['drone_cash_mult', 'drone_frequency_mult', 'drone_reward_mult', 'earning_mrcb_mult',
        'farm_value_mult'],
        scoreFn: (e) => [ Math.min(1, 0.7*e.get('drone_cash_mult'))*
                          e.get('drone_frequency_mult')*
                          e.get('drone_reward_mult')*
                          Math.sqrt((userData.value?.mrcbEarningBonus ?? 5) + e.get('earning_mrcb_mult'))*
                          e.get('farm_value_mult') ],
    },
]);


watch(userData, updateSets);
watch(reslottingSetting, updateSets);


function updateSets() {
    for (const entry of sets.value) {
        updateSet(entry);
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
                                      setEntry.scoreFn);
        console.log(setEntry.title, setEntry.solution);

    } catch (e) {
        errorMessage.value = "An error occured.\nTry to clear your browser cache and reload your inventory.\nIf the error persist, contact the developper.\n\n"+(e instanceof Error ? e.message : String(e));
        setEntry.solution = null;
        return;
    }
}


</script>

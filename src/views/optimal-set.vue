<template>
    <load-eid :userData="userData" @onloaded="(x: T.UserData) => userData = x"></load-eid>

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

    <section v-if="!errorMessage" class="main-sets">

        <template v-if="userData" v-for="entry of sets">
            <artifact-set-card v-if="entry.solution"
                :title="entry.title"
                :description="entry.description"
                :set="entry.solution"
                :userData="userData"
                />
        </template>

    </section>
</template>

<style scoped src="@/styles/earning-set.css"></style>

<script setup lang="ts">
import { ref, shallowRef, triggerRef, watch } from 'vue';
import * as T from '@/scripts/types.ts';
import { EffectMap } from '@/scripts/artifacts.ts';
import { createSetting } from '@/scripts/settings.ts';
import { prepareItems, searchSet } from '@/scripts/solvers.ts';


type SetEntry = {
    title: string,
    description?: string,
    solution?: T.ArtifactSet|null,
    effects: string[],
    scoreFn: (effect: EffectMap) => number[];
};

const reslottingSetting = createSetting<boolean>({
    localStorageKey: 'allow-reslotting',
    defaultValue: false,
});

const errorMessage = ref<string>("");

const userData = shallowRef<T.UserData>(null); // loaded via load-eid component
const sets = shallowRef<SetEntry[]>([
    {
        title: "Preloaded RCB Prestige",
        effects: [
            'prophecy_egg_bonus',
            'boost_bonus',
            'laying_bonus',
            'soul_egg_collection_bonus',
            'hab_capacity_bonus',
            'egg_value_bonus',
            'running_chicken_bonus',
            'soul_egg_bonus',
        ],
        scoreFn: (e) => {
            let score = 1;
            score *= e.get('hab_capacity_bonus');
            score *= e.get('laying_bonus');
            score *= e.get('egg_value_bonus');
            score *= (userData.value?.mrcbEarningBonus ?? 340) + e.get('running_chicken_bonus');
            score *= (userData.value?.soulEggBonus ?? 0) + e.get('soul_egg_bonus');
            score *= Math.pow((userData.value?.prophecyEggBonus ?? 1.05) + e.get('prophecy_egg_bonus'),
                              userData.value?.prophecyEggs ?? 0);
            score *= e.get('boost_bonus')**2;
            score *= e.get('soul_egg_collection_bonus');
            return [ score ];
        },
    },
    {
        title: "AIO RCB Prestige",
        effects: [
            'prophecy_egg_bonus',
            'boost_bonus',
            'laying_bonus',
            'soul_egg_collection_bonus',
            'internal_hatchery_bonus',
            'egg_value_bonus',
            'running_chicken_bonus',
            'soul_egg_bonus',
        ],
        scoreFn: (e) => {
            let score = 1;
            score *= e.get('internal_hatchery_bonus');
            score *= e.get('laying_bonus');
            score *= e.get('egg_value_bonus');
            score *= (userData.value?.mrcbEarningBonus ?? 340) + e.get('running_chicken_bonus');
            score *= (userData.value?.soulEggBonus ?? 0) + e.get('soul_egg_bonus');
            score *= Math.pow((userData.value?.prophecyEggBonus ?? 1.05) + e.get('prophecy_egg_bonus'),
                              userData.value?.prophecyEggs ?? 0);
            score *= e.get('boost_bonus')**3;
            score *= e.get('soul_egg_collection_bonus');
            return [ score ];
        },
    },
    {
        title: "Multi RCB Prestige",
        effects: [
            'prophecy_egg_bonus',
            'boost_bonus',
            'laying_bonus',
            'soul_egg_collection_bonus',
            'internal_hatchery_bonus',
            'egg_value_bonus',
            'running_chicken_bonus',
            'soul_egg_bonus',
        ],
        scoreFn: (e) => {
            let score = 1;
            score *= e.get('internal_hatchery_bonus');
            score *= e.get('laying_bonus');
            score *= e.get('egg_value_bonus');
            score *= (userData.value?.mrcbEarningBonus ?? 340) + e.get('running_chicken_bonus');
            score *= (userData.value?.soulEggBonus ?? 0) + e.get('soul_egg_bonus');
            score *= Math.pow((userData.value?.prophecyEggBonus ?? 1.05) + e.get('prophecy_egg_bonus'),
                              userData.value?.prophecyEggs ?? 0);
            score *= e.get('boost_bonus')**3;
            score *= e.get('soul_egg_collection_bonus');
            return [ score ];
        },
    },
    {
        title: "Preloaded Lunar Prestige",
        effects: [
            'prophecy_egg_bonus',
            'boost_bonus',
            'laying_bonus',
            'soul_egg_collection_bonus',
            'hab_capacity_bonus',
            'egg_value_bonus',
            'away_earning_bonus',
            'soul_egg_bonus',
        ],
        scoreFn: (e) => {
            let score = 1;
            score *= e.get('hab_capacity_bonus');
            score *= e.get('laying_bonus');
            score *= e.get('egg_value_bonus');
            score *= e.get('away_earning_bonus');
            score *= (userData.value?.soulEggBonus ?? 0) + e.get('soul_egg_bonus');
            score *= Math.pow((userData.value?.prophecyEggBonus ?? 1.05) + e.get('prophecy_egg_bonus'),
                              userData.value?.prophecyEggs ?? 0);
            score *= e.get('boost_bonus')**2;
            score *= e.get('soul_egg_collection_bonus');
            return [ score ];
        },
    },
    {
        title: "AIO Lunar Prestige",
        effects: [
            'prophecy_egg_bonus',
            'boost_bonus',
            'laying_bonus',
            'soul_egg_collection_bonus',
            'internal_hatchery_bonus',
            'hab_capacity_bonus',
            'egg_value_bonus',
            'away_earning_bonus',
            'soul_egg_bonus',
        ],
        scoreFn: (e) => {
            let score = 1;
            //score *= e.get('internal_hatchery_bonus'); // only counted the first couple minutes, we ignore it
            score *= e.get('hab_capacity_bonus');
            score *= e.get('laying_bonus');
            score *= e.get('egg_value_bonus');
            score *= e.get('away_earning_bonus');
            score *= (userData.value?.soulEggBonus ?? 0) + e.get('soul_egg_bonus');
            score *= Math.pow((userData.value?.prophecyEggBonus ?? 1.05) + e.get('prophecy_egg_bonus'),
                              userData.value?.prophecyEggs ?? 0);
            score *= e.get('boost_bonus')**2;
            score *= e.get('soul_egg_collection_bonus');
            return [ score ];
        },
    },
    {
        title: "Multi Lunar Prestige",
        effects: [
            'prophecy_egg_bonus',
            'boost_bonus',
            'laying_bonus',
            'soul_egg_collection_bonus',
            'internal_hatchery_bonus',
            'egg_value_bonus',
            'away_earning_bonus',
            'soul_egg_bonus',
        ],
        scoreFn: (e) => {
            let score = 1;
            score *= e.get('internal_hatchery_bonus');
            score *= e.get('laying_bonus');
            score *= e.get('egg_value_bonus');
            score *= e.get('away_earning_bonus');
            score *= (userData.value?.soulEggBonus ?? 0) + e.get('soul_egg_bonus');
            score *= Math.pow((userData.value?.prophecyEggBonus ?? 1.05) + e.get('prophecy_egg_bonus'),
                              userData.value?.prophecyEggs ?? 0);
            score *= e.get('boost_bonus')**3;
            score *= e.get('soul_egg_collection_bonus');
            return [ score ];
        },
    },
    {
        title: "Dilithium",
        effects: ['boost_duration_bonus'],
        scoreFn: (e) => [ e.get('boost_duration_bonus') ],
    },
    {
        title: "IHR",
        effects: ['internal_hatchery_bonus', 'boost_bonus', 'hab_capacity_bonus'],
        scoreFn: (e) => [ e.get('internal_hatchery_bonus')*e.get('boost_bonus'), e.get('hab_capacity_bonus') ],
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
            'laying_bonus',
            'boost_bonus',
            'internal_hatchery_bonus',
        ],
        scoreFn: (e) => {
            let score = 1;
            score *= e.get('internal_hatchery_bonus');
            score *= e.get('laying_bonus');
            score *= e.get('boost_bonus');
            return [ score ];
        },
    },
    {
        title: "Drone (GE)",
        effects: ['drone_gold_bonus', 'drone_frequency_bonus', 'drone_reward_bonus'],
        scoreFn: (e) => [ Math.min(1, 0.3*e.get('drone_gold_bonus'))*e.get('drone_frequency_bonus')*e.get('drone_reward_bonus') ],
    },
    {
        title: "Drone (Cash)",
        effects: ['drone_cash_bonus', 'drone_frequency_bonus', 'drone_reward_bonus'],
        scoreFn: (e) => [ Math.min(1, 0.7*e.get('drone_cash_bonus'))*e.get('drone_frequency_bonus')*e.get('drone_reward_bonus') ],
    },
]);


watch(userData, () => {
    if (!userData.value) return;
    localStorage.setItem('user-data', JSON.stringify(userData.value));
});
watch(userData, updateSets);
watch(reslottingSetting, updateSets);


function updateSets() {
    for (const entry of sets.value) {
        updateSet(entry);
    }
    triggerRef(sets);
}

function updateSet(setEntry: SetEntry) {
    if (!userData.value) return;
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

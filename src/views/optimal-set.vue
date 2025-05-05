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
                :boosts="entry.boosts"
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
    boosts?: T.BoostCategory[],
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

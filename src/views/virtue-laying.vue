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
        <setting-text id="base-laying-rate"
                      v-model="baseLayingRateSetting"
                      label="Base laying rate"
                      tooltip="Laying rate without artifacts equipped."/>
        <setting-text id="base-shipping-rate"
                      v-model="baseShippingRateSetting"
                      label="Base shipping rate"
                      tooltip="Maximum shipping rate without artifacts equipped."/>
    </section>

    <pre v-if="errorMessage" class="invalid-text" style="white-space:preserve">{{ errorMessage }}</pre>

    <section class="main">
        <div v-if="visibleBefore > 0 || visibleIdx - visibleBefore - 1 >= 0" class="sets">
            <a href='#' v-if="visibleIdx - visibleBefore - 1 >= 0" @click="visibleBefore += 1">
                {{ visibleBefore ? "more sets" : "show set" }} for higher shipping
            </a>
            <inventory-frame v-for="entry in entries.slice(visibleIdx-visibleBefore, visibleIdx)"
                             :key="JSON.stringify(entry.set.artifacts)"
                             :artifacts="entry.set.artifacts"
                             :isSet="true"
                             :userData="userData"
                             :column="4" :row="1"
                             :virtue="true"
                             />
        </div>
        <div v-if="entries.length" class="sets targeted">
            <inventory-frame :key="JSON.stringify(entries[visibleIdx].set.artifacts)"
                             :artifacts="entries[visibleIdx].set.artifacts"
                             :isSet="true"
                             :userData="userData"
                             :column="4" :row="1"
                             :virtue="true"
                             />
        </div>
        <div v-if="visibleAfter > 0 || visibleIdx + visibleAfter + 1 < entries.length" class="sets">
            <inventory-frame v-for="entry in entries.slice(visibleIdx+1, visibleIdx+1+visibleAfter)"
                             :key="JSON.stringify(entry.set.artifacts)"
                             :artifacts="entry.set.artifacts"
                             :isSet="true"
                             :userData="userData"
                             :column="4" :row="1"
                             :virtue="true"
                             />
            <a href='#' v-if="visibleIdx + visibleAfter + 1 < entries.length" @click="visibleAfter += 1">
                {{ visibleAfter ? "more sets" : "show set" }} for higher laying
            </a>
        </div>
        <span v-if="!entries.length && !errorMessage" class="invalid-text">
            You don't have enough artifacts to build a laying set.
        </span>
    </section>
</template>

<style scoped src="@/styles/virtue-laying.css"></style>

<script setup lang="ts">
import { ref, computed, shallowRef, watch } from 'vue';
import * as T from '@/scripts/types.ts';
import { parseRate, formatRate } from '@/scripts/utils.ts';
import { createTextInputSetting, createSetting } from '@/scripts/settings.ts';
import { Effects } from '@/scripts/effects.ts';
import { computeOptimalSets } from '@/scripts/laying-set.ts';
import type { AnnotatedSet } from '@/scripts/laying-set.ts';

type EntryType = {
    set: AnnotatedSet<T.Artifact | null>,
    variants: AnnotatedSet<T.Artifact | null>[],
};


// Settings variables
const reslottingSetting = createSetting<0|1|2|3>({
    localStorageKey: 'laying-reslotting',
    defaultValue: 0,
});
const baseLayingRateSetting = createTextInputSetting<number|null>({
    localStorageKey: 'laying-base-laying-rate',
    defaultValue: null,
    parser: (s: string) => s ? parseRate(s) : null,
    formatter: (x: number|null): string => formatRate(x ?? baseLayingRate.value),
});
const baseShippingRateSetting = createTextInputSetting<number|null>({
    localStorageKey: 'laying-base-shipping-rate',
    defaultValue: null,
    parser: (s: string) => s ? parseRate(s) : null,
    formatter: (x: number|null): string => formatRate(x ?? baseShippingRate.value),
});


// State variables
const errorMessage = ref<string>("");
const baseLayingRate = computed<number>(() => baseLayingRateSetting.value ??
                                              (userData.value?.maxedEffects ?? Effects.initial).max_laying_rate);
const baseShippingRate = computed<number>(() => baseShippingRateSetting.value ??
                                                (userData.value?.maxedEffects ?? Effects.initial).shipping_rate);


// Data variables
const userData = shallowRef<T.UserData>(); // loaded via load-eid component
const entries = shallowRef<EntryType[]>([]); // List of solutions (sets along additional info), populated via updateEntries
const visibleIdx = ref<number>(0);
const visibleBefore = ref<number>(0);
const visibleAfter = ref<number>(0);



// Watchers for triggering recomputations
watch([userData, reslottingSetting], updateEntries);
watch([baseLayingRate, baseShippingRate], updateVisible);


/**
 * Find the optimal sets and populate view entries
 */
function updateEntries() {
    console.log("Update entries");

    const maxSlot: number = userData.value?.proPermit ? 4 : 2;
    let sets: AnnotatedSet<T.Artifact | null>[][];
    try {
        errorMessage.value = "";

        sets = computeOptimalSets(userData.value?.virtueItems ?? [],
                                  maxSlot,
                                  reslottingSetting.value,
                                  T.DeflectorMode.NONE,
                                  T.AllowedGusset.ANY);
    } catch (e) {
        errorMessage.value = "An error occured.\nTry to clear your browser cache and reload your inventory.\nIf the error persist, contact the developper.\n\n"+(e instanceof Error ? e.message : String(e));
        entries.value = [];
        return;
    }

    const sortKey = (x: AnnotatedSet<T.Artifact | null>[]) => x[0]?.shippingBonus/x[0]?.layingBonus;
    sets.sort((a, b) => sortKey(a) - sortKey(b));

    const contractFamilies = [
        T.ArtifactFamily.QUANTUM_METRONOME,
        T.ArtifactFamily.INTERSTELLAR_COMPASS,
        T.ArtifactFamily.GUSSET,
    ]
    function generateKey(set: AnnotatedSet<T.Artifact | null>) {
        return set.artifacts.map(artifact => {
            if (!artifact) return "null";
            const artiKey = contractFamilies.includes(artifact.family) ?
                `${artifact.category}-${artifact.family}-${artifact.tier}-${artifact.rarity}` :
                "holder";
            const stoneKeys = artifact?.stones.map(stone => (stone ?
                `${stone.category}-${stone.family}-${stone.tier}` :
                "null")) ?? [];
            return artiKey + "(" + stoneKeys.sort().join('+')+")";
        }).sort().join(',');
    }


    // Update the artifacts shown on the view
    entries.value = [];
    for (const equivalentSets of sets) {
        const set = equivalentSets[0] as AnnotatedSet<T.Artifact | null>;
        if (!set || set.artifacts.length === 0) continue;

        const seen = new Set();
        seen.add(generateKey(set));
        const variants = [];
        for (const eqSet of equivalentSets) {
            const variant = eqSet as AnnotatedSet<T.Artifact | null>;
            const key = generateKey(variant);
            if (seen.has(key)) continue;
            seen.add(key);
            variants.push(variant);
            if (seen.size >= 6) break;
        }

        entries.value.push({
            set: set,
            variants: variants,
        });
    }

    updateVisible();
}

function updateVisible() {

    let prevShippingRate = 0;

    visibleIdx.value = 0;
    for (let idx = 0; idx < entries.value.length; idx++) {
        const entry = entries.value[idx];
        const shippingRate = baseShippingRate.value * entry.set.shippingBonus;
        const layingRate = baseLayingRate.value * entry.set.layingBonus;

        const lowerThreshold = prevShippingRate/layingRate - 1;

        if (lowerThreshold >= 0) {
            visibleIdx.value = idx;
            break;
        }

        prevShippingRate = shippingRate;
    }

}

</script>

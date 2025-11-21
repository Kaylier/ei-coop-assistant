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
    </section>

    <pre v-if="errorMessage" class="invalid-text" style="white-space:preserve">{{ errorMessage }}</pre>

    <section class="main">
        <div v-if="entries.length" class="sets">
            <inventory-frame v-for="entry in entries"
                             :key="JSON.stringify(entry.set.artifacts)"
                             :artifacts="entry.set.artifacts"
                             :isSet="true"
                             :userData="userData"
                             :column="4" :row="1"
                             />
        </div>
        <span v-if="!entries.length && !errorMessage" class="invalid-text">
            You don't have enough artifacts to build a laying set.
        </span>
    </section>
</template>

<style scoped src="@/styles/virtue-laying.css"></style>

<script setup lang="ts">
import { ref, shallowRef, watch } from 'vue';
import * as T from '@/scripts/types.ts';
import { createSetting } from '@/scripts/settings.ts';
import { computeOptimalSets } from '@/scripts/laying-set.ts';
import type { AnnotatedSet } from '@/scripts/laying-set.ts';

type EntryType = {
    set: (AnnotatedSet<T.Artifact | null> & { rainbowed: boolean }),
    variants: (AnnotatedSet<T.Artifact | null> & { rainbowed: boolean })[],
};


// Settings variables
const reslottingSetting = createSetting<0|1|2|3>({
    localStorageKey: 'laying-reslotting',
    defaultValue: 0,
});


// State variables
const errorMessage = ref<string>("");


// Data variables
const userData = shallowRef<T.UserData>(); // loaded via load-eid component
const entries = shallowRef<EntryType[]>([]); // List of solutions (sets along additional info), populated via updateEntries



// Watchers for triggering recomputations
watch([userData, reslottingSetting], updateEntries);


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
        const set = equivalentSets[0] as AnnotatedSet<T.Artifact | null> & { rainbowed: boolean };
        if (!set || set.artifacts.length === 0) continue;

        const seen = new Set();
        seen.add(generateKey(set));
        const variants = [];
        for (const eqSet of equivalentSets) {
            const variant = eqSet as AnnotatedSet<T.Artifact | null> & { rainbowed: boolean };
            const key = generateKey(variant);
            if (seen.has(key)) continue;
            seen.add(key);
            variant.rainbowed = variant.artifacts.some(artifact => artifact && artifact.family === 0);
            variants.push(variant);
            if (seen.size >= 6) break;
        }

        entries.value.push({
            set: set,
            variants: variants,
        });
    }
}

</script>

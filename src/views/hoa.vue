<template>
    <load-eid v-model="userData"/>

    <a class="quick-link smartphone-only" href="#artifacts">go to artifacts</a>

    <section class="inputs">
        <setting-switch :hide="!virtueGrid.length"
                        label="Path of"
                        id="farm"
                        v-model="farmSetting"
                        :options="[
                                  { value: 0, label: 'Enlightenment' },
                                  { value: 1, label: 'Virtue' },
                                  ]"/>
    </section>

    <section v-if="userData && farmSetting.value == 0" class="main">
        <div v-if="sets.length" class="sets" id="sets">
            <inventory-frame v-for="set in sets"
                             :key="JSON.stringify(set)"
                             :artifacts="set"
                             :isSet="true"
                             :userData="userData"
                             :column="4" :row="1"
                             />
        </div>
        <div v-if="grid.length" class="grid-container" id="artifacts">
            <div class="grid" :style="`width: ${column*4}rem;`">
                <inventory-frame :artifacts="grid" :column="column" />
            </div>
        </div>
    </section>

    <section v-if="userData && farmSetting.value == 1" class="main">
        <div v-if="virtueGrid.length" class="grid-container" id="artifacts">
            <div class="grid" :style="`width: ${virtueColumn*4}rem;`">
                <inventory-frame :artifacts="virtueGrid" :column="virtueColumn" />
            </div>
        </div>
    </section>
</template>

<style scoped src="@/styles/hoa.css"></style>

<script setup lang="ts">
import { shallowRef, ref, watch } from 'vue';
import * as T from '@/scripts/types.ts';
import { createSetting } from '@/scripts/settings.ts';


const farmSetting = createSetting<number>({
    localStorageKey: 'hoa-farm',
    defaultValue: 0,
});


// Template variables declarations and default values
const userData = shallowRef<T.UserData>();
const grid     = ref<(T.Item | null)[]>([]);
const sets     = ref<(T.Item | null)[][]>([]);
const column   = ref<number>(16);
const virtueGrid   = ref<(T.Item | null)[]>([]);
const virtueColumn = ref<number>(16);


watch(userData, updateView);



function isArtifact(item: T.Item): item is T.Artifact {
    return item.category === T.ItemCategory.ARTIFACT;
}

/*
 * Count the amount of items with a certain rarity
 */
function countRarity(items: T.Item[], rarity: T.Rarity | null): number {
    let c = 0;
    for (const item of items) {
        if (rarity !== null && !isArtifact(item)) continue;
        if (rarity !== null && (item as T.Artifact).rarity !== rarity) continue;
        c += item.quantity ?? 1;
    }
    return c;
}

/*
 * Count the amount of stones slotted in an item
 */
function countStones(item: T.Item): number {
    if (!isArtifact(item)) return 0;
    return (item as T.Artifact).stones.reduce((tot: number, stone: T.Stone | null) =>
                                              tot = (stone === null) ? tot : tot + 1,
                                              0);
}

/*
 * Update the view through grid and sets variables
 */
function updateView() {
    const sortedGroups = itemsToGrid(userData.value?.items ?? []);
    column.value = Math.max(...Object.values(sortedGroups).map(arr => arr.length));

    grid.value = [];
    for (const group of sortedGroups) {
        for (const item of group) {
            grid.value.push(item);
        }
        while (grid.value.length % column.value) {
            grid.value.push(null);
        }
    }

    const virtueSortedGroups = itemsToGrid(userData.value?.virtueItems ?? []);
    virtueColumn.value = Math.max(...Object.values(virtueSortedGroups).map(arr => arr.length));

    virtueGrid.value = [];
    for (const group of virtueSortedGroups) {
        for (const item of group) {
            virtueGrid.value.push(item);
        }
        while (virtueGrid.value.length % virtueColumn.value) {
            virtueGrid.value.push(null);
        }
    }

    sets.value = userData.value?.sets ?? [];
}

function itemsToGrid(items: T.Item[]): T.Item[][] {

    items = [...items ?? []].sort((a, b) =>
           a.category - b.category
        || a.family - b.family
        || b.tier - a.tier
        || (isArtifact(b) ? b.rarity : T.Rarity.COMMON) - (isArtifact(a) ? a.rarity : T.Rarity.COMMON)
        || countStones(b) - countStones(a)
        || (a.id ?? 0) - (b.id ?? 0));

    const groups = new Map<string, T.Item[]>();
    for (const item of items) {
        const key = `${item.category}-${item.family}`;
        if (!groups.has(key))
            groups.set(key, []);
        groups.get(key)!.push(item);
    }

    const sortedGroups: T.Item[][] = [...groups.values()].sort((a, b) =>
            a[0].category - b[0].category
         || countRarity(b, T.Rarity.LEGENDARY) - countRarity(a, T.Rarity.LEGENDARY)
         || countRarity(b, T.Rarity.EPIC) - countRarity(a, T.Rarity.EPIC)
         || countRarity(b, T.Rarity.RARE) - countRarity(a, T.Rarity.RARE)
         || countRarity(b, null) - countRarity(a, null));

    return sortedGroups;
}

</script>


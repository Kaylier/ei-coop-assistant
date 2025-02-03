<template>
    <load-eid :userData="userData" @onloaded="(x) => userData = x"></load-eid>

    <pre v-if="errorMessage" class="invalid-text" style="white-space:preserve">{{ errorMessage }}</pre>

    <section class="main">
        <div class="sets">
            <inventory-view v-for="set in sets"
                            :artifacts="set"
                            :isSet="true"
                            :proPermit="userData.proPermit"
                            :column=4 :row=1
                            />
        </div>
        <div class="grid">
            <inventory-view
                :artifacts="grid"
                :column="column"
                />
        </div>
    </section>
</template>

<style scoped src="/css/hoa.css"></style>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { checkEID } from '/scripts/utils.ts';
import * as T from '/scripts/types.ts';
import { getUserData } from '/scripts/api.ts';


// Template variables declarations and default values
const eid = ref("");
const isLoadingEID = ref(false);

const userData = ref(null);
const grid = ref([]);
const sets = ref([]);
const column = ref(16);

const errorMessage = ref("");


// Save to local storage
watch(userData, () => {
    if (!userData.value) return;
    localStorage.setItem('user-data', JSON.stringify(userData.value));
    updateView();
});



function countRarity(l, rarity) {
    let c = 0;
    for (let item of l) {
        if (!rarity || item.rarity == rarity)
            c += item.quantity;
    }
    return c;
}

function updateView() {

    const items = [...userData.value.items].sort((a, b) => a.category - b.category
                                                         || a.family - b.family
                                                         || b.tier - a.tier
                                                         || b.rarity - a.rarity
                                                         || b.stones.filter(s => s !== null).length - a.stones.filter(s => s !== null).length
                                                         || a.id - b.id);

    let itemIdMap = {null: null};

    let groups = {};
    for (let item of items) {
        if (item.category != T.ItemCategory.ARTIFACT) continue;
        const key = `${item.category}-${item.family}`;
        if (!groups[key])
            groups[key] = [];
        groups[key].push(item);
        itemIdMap[item.id] = item;
    }

    const sortedGroups = Object.values(groups).sort((a, b) =>
            countRarity(b, T.Rarity.LEGENDARY) - countRarity(a, T.Rarity.LEGENDARY)
         || countRarity(b, T.Rarity.EPIC) - countRarity(a, T.Rarity.EPIC)
         || countRarity(b, T.Rarity.RARE) - countRarity(a, T.Rarity.RARE)
         || countRarity(b, null) - countRarity(a, null)
        );

    column.value = Math.max(...Object.values(sortedGroups).map(arr => arr.length));

    grid.value = [];
    for (const group of sortedGroups) {
        for (const item of group) {
            grid.value.push(item);
        }
        while (grid.value.length % column.value)
            grid.value.push(null);
    }

    sets.value = userData.value.sets.map(set => set.map(setId => itemIdMap[setId]));
}

</script>


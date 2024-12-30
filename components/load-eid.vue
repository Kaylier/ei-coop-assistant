<template>
    <section class="loading">
        <form action="javascript:void(0);" id="eid">
            <input placeholder="EIxxxxxxxxxxxxxxxx"
                :class="{ invalid: !checkEID(eid) }"
                v-model="eid" ></input>
            <button
                :disabled="!checkEID(eid) || isLoadingEID"
                :class="{ invalid: !checkEID(eid) }"
                :title="checkEID(eid) ? '' : 'Player EID must be of the form EI1234567890123456 (16 digits)'"
                @click="load(eid)">
                Load from EID
            </button>
        </form>
        <div v-if="isLoadingEID" class="active-text">
            <img src="/img/icons/loading.svg">
        </div>
        <pre v-else-if="errorMsg" class="invalid-text" style="white-space:preserve">{{ errorMsg || "Error" }}</pre>
        <div v-else-if="!inventory || !inventory.items" class="invalid-text">
            No inventory loaded
        </div>
        <div v-else-if="inventory.items.length" class="valid-text">
            {{ (inventory.items.reduce((tot, cur) => tot + cur.quantity, 0)).toLocaleString() }} items loaded - {{ inventory.date.toLocaleString() }}
        </div>
        <div v-else class="invalid-text">
            Empty inventory
        </div>
    </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { checkEID } from '/scripts/utils.ts';
import { getInventory } from '/scripts/api.ts';

const props = defineProps<{
    inventory
}>();

const emit = defineEmits<{
    (e: 'onloaded', inventory: object): void
}>();

const eid = ref("");
const isLoadingEID = ref(false);
const errorMsg = ref(null);

Vue.onMounted(async () => {
    eid.value = localStorage.getItem('player-eid') ??
                eid.value;

    let saved = JSON.parse(localStorage.getItem('inventory'));
    if (saved && saved['date']) saved['date'] = new Date(saved['date'])
    if (saved) {
        emit('onloaded', saved);
    } else if (checkEID(eid.value)) {
        load(eid.value);
    }
});


async function load(eid: String) {
    if (!checkEID(eid))
        throw new Error("Invalid EID format");

    if (isLoadingEID.value) return;
    isLoadingEID.value = true;
    errorMsg.value = null;

    console.log("Loading from EID", eid);

    let inventory = null;

    try {
        inventory = await getInventory(eid);
        isLoadingEID.value = false;
    } catch (e) {
        console.error("Error loading inventory:", e);
        errorMsg.value = e;
        isLoadingEID.value = false;
        return
    }

    localStorage.setItem('player-eid', eid);

    emit('onloaded', inventory);
}

</script>

<style scoped>

.loading {
    display: flex;
    flex-direction: column;
}

#eid {
    display: flex;
    flex-flow: row nowrap;
    padding: 1em;
}

#eid input, #eid button {
    width: 10.2em;
    padding: 0.75em 1.5em;
    font-size: 11pt;
    box-sizing: content-box;
}

#eid input {
    border-radius: 10px 0 0 10px;
}

#eid button {
    border-radius: 0 10px 10px 0;
}

@media (max-width: 26em) {
    #eid {
        flex-flow: column nowrap;
    }

    #eid input {
        border-radius: 10px 10px 0 0;
    }

    #eid button {
        border-radius: 0 0 10px 10px;
    }
}


.loading div {
    margin: auto;
    font-size: 8pt;
    font-style: italic;
    height: 3em;
    align-content: center;
}

.loading img {
    height: 100%;
}

</style>


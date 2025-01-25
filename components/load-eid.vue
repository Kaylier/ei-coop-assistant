<template>
    <section class="loading">
        <form action="javascript:void(0);" id="eid">
            <input placeholder="EIxxxxxxxxxxxxxxxx"
                :class="{ invalid: !checkEID(eid) }"
                v-model="eid" ></input>
            <button
                :disabled="!checkEID(eid) || isLoadingEID"
                :class="{ invalid: !checkEID(eid), 'tooltip-icon': !checkEID(eid) }"
                @click="load(eid)">
                Load from EID
                <span v-if="!checkEID(eid)" class="tooltip-text invalid-text">
                    Player EID must be of the form<br/>EI1234567890123456 (16 digits)
                </span>
            </button>
        </form>
        <div v-if="isLoadingEID" class="active-text">
            <img src="/img/icons/loading.svg">
        </div>
        <pre v-else-if="errorMsg" class="invalid-text" style="white-space:preserve">{{ errorMsg || "Error" }}</pre>
        <div v-else-if="!userData || !userData.items" class="invalid-text">
            No inventory loaded
        </div>
        <div v-else-if="userData.items.length" class="valid-text">
            {{ (userData.items.reduce((tot, cur) => tot + cur.quantity, 0)).toLocaleString() }} items loaded - {{ userData.date.toLocaleString() }}
            <span v-if="Date.now() - userData.date > 3600000*24*7" class="tooltip-icon warning-text">
                ⚠
                <span class="tooltip-text">
                    This inventory has not been updated for over a week.<br/>
                    Load it again to take new artifacts into account.
                </span>
            </span>
        </div>
        <div v-else class="invalid-text">
            Empty inventory
        </div>
    </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { checkEID, checkSID } from '/scripts/utils.ts';
import { getUserData } from '/scripts/api.ts';

const props = defineProps<{
    userData
}>();

const emit = defineEmits<{
    (e: 'onloaded', userData: object): void
}>();

const eid = ref("");
const isLoadingEID = ref(false);
const errorMsg = ref(null);

Vue.onMounted(async () => {
    eid.value = (new URLSearchParams(window.location.search)).get('eid') ??
                localStorage.getItem('player-eid') ??
                eid.value;

    let saved = JSON.parse(localStorage.getItem('user-data'));
    if (saved) {
        if (saved['date'])
            saved['date'] = new Date(saved['date']);
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

    let userData = null;

    try {
        userData = await getUserData(eid);
        isLoadingEID.value = false;
    } catch (e) {
        console.error("Error loading user data:", e);
        errorMsg.value = e;
        isLoadingEID.value = false;
        return
    }

    if (!checkSID(eid)) {
        localStorage.setItem('player-eid', eid);
    }

    emit('onloaded', userData);
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
    height: min(4em, 12vw);
    width: min(4em, 12vw);
    margin: auto;
}

</style>


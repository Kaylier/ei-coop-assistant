<template>
    <section class="loading">
        <form action="javascript:void(0);" id="eid">
            <input type="text"
                placeholder="EIxxxxxxxxxxxxxxxx"
                :class="{ invalid: !checkEID(eid) }"
                v-model="eid"
                />
            <button
                :disabled="!checkEID(eid) || isLoadingEID"
                :class="{ invalid: !checkEID(eid), 'tooltip-icon': !checkEID(eid) }"
                @click="load(eid)">
                Load from EID
                <span v-if="!checkEID(eid)" class="tooltip-text invalid-text">
                    Player EID must be of the form<br/>
                    EI1234567890123456 (16 digits)
                </span>
            </button>
        </form>
        <div v-if="isLoadingEID" class="active-text">
            <img src="/img/icons/loading.svg" />
        </div>
        <pre v-else-if="errorMsg" class="invalid-text" style="white-space:preserve">{{ errorMsg || "Error" }}</pre>
        <div v-else-if="!userData || !userData.items" class="invalid-text">
            No inventory loaded
        </div>
        <div v-else-if="userData.items.length" class="valid-text">
            {{ itemCount.toLocaleString() }} items loaded - {{ userData.date.toLocaleString() }}
            <span v-if="Date.now() - userData.date.getTime() > 3600000*24*7" class="tooltip-icon warning-text">
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
import { onMounted, ref, computed } from 'vue';
import * as T from '@/scripts/types.ts';
import { checkEID, checkSID } from '@/scripts/utils.ts';
import { getUserData } from '@/scripts/api.ts';

const props = defineProps<{
    userData: T.UserData,
}>();

const emit = defineEmits<{
    (e: 'onloaded', userData: T.UserData): void
}>();

const eid = ref<string>("");
const isLoadingEID = ref<boolean>(false);
const errorMsg = ref<string>("");

const itemCount = computed((): number => {
  return props.userData?.items?.reduce((tot: number, cur: T.Item) => tot + (cur.quantity ??
  1), 0) ?? 0;
});

onMounted(async () => {
    eid.value = (new URLSearchParams(window.location.search)).get('eid') ??
                localStorage.getItem('player-eid') ??
                eid.value;

    const savedStr = localStorage.getItem('user-data');
    if (savedStr) {
        const saved = JSON.parse(savedStr);
        if (saved && saved['date'])
            saved['date'] = new Date(saved['date']);
        emit('onloaded', saved);
    } else if (checkEID(eid.value)) {
        load(eid.value);
    }
});


async function load(eid: string) {
    if (!checkEID(eid))
        throw new Error("Invalid EID format");

    if (isLoadingEID.value) return;
    isLoadingEID.value = true;
    errorMsg.value = "";

    console.log("Loading from EID", eid);

    let userData = null;

    try {
        userData = await getUserData(eid);
        isLoadingEID.value = false;
    } catch (e) {
        console.error("Error loading user data:", e);
        errorMsg.value = String(e);
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
    align-items: center;
}

#eid {
    display: flex;
    flex-flow: row nowrap;
    padding: 1em;
}

#eid input, #eid button {
    width: 10.2em;
    padding: 0.75em 1.5em;
    font-size: 0.95em;
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
    font-size: 0.75em;
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


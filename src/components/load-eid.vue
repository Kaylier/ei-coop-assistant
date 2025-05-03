<template>
    <section class="loading" @focusin="focused = true" @focusout="focused = false">
        <form action="javascript:void(0);" id="eid">
            <input type="text"
                   placeholder="EIxxxxxxxxxxxxxxxx"
                   :class="{ invalid: !checkEID(eid), concealed: !focused }"
                   v-model="eid"
                   />
            <button :disabled="!checkEID(eid) || isLoadingEID"
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
            <span v-if="Date.now() - userData.date.getTime() > 3600000*24*7" tabindex="0" class="tooltip-icon warning-text">
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
import { Effects } from '@/scripts/effects.ts';
import type { EffectKey } from '@/scripts/effects.ts';

const userData = defineModel<T.UserData>({ required: true });

const focused = ref<boolean>(false);

const eid = ref<string>("");
const isLoadingEID = ref<boolean>(false);
const errorMsg = ref<string>("");

const itemCount = computed((): number => {
    return userData.value?.items?.reduce((tot: number, cur: T.Item) => tot + (cur.quantity ?? 1), 0) ?? 0;
});

onMounted(async () => {
    const queryEID = (new URLSearchParams(window.location.search)).get('eid');
    const storedEID = localStorage.getItem('player-eid');

    let reload: boolean = (new URLSearchParams(window.location.search)).has('reload');

    if (queryEID && checkEID(queryEID)) {
        eid.value = queryEID;
        reload ||= queryEID !== storedEID;
    } else if (storedEID && checkEID(storedEID)) {
        eid.value = storedEID;
    }

    const saved = localStorage.getItem('user-data');
    let loaded = null;
    if (!reload && saved) {
        try {
            loaded = JSON.parse(saved);
            if (loaded && loaded.date)
                loaded.date = new Date(loaded.date);
            if (loaded && loaded.baseEffects)
                loaded.baseEffects = Effects.fromJSON(loaded.baseEffects as Record<EffectKey, number>);
            if (loaded && loaded.maxedEffects)
                loaded.maxedEffects = Effects.fromJSON(loaded.maxedEffects as Record<EffectKey, number>);
        } catch (err) {
            console.warn('Clearing invalid JSON from user-data:', err);
            localStorage.removeItem('user-data');
            loaded = null;
        }
    }

    if (loaded) {
        // User data found in localStorage, use it
        userData.value = loaded;
    } else if (checkEID(eid.value)) {
        await load(eid.value);
    }
});


async function load(eid: string) {
    if (!checkEID(eid))
        throw new Error("Invalid EID format");

    if (isLoadingEID.value) return;

    console.log("Loading from EID", eid);

    isLoadingEID.value = true;
    errorMsg.value = "";


    let loaded: T.UserData|null = null;
    try {
        loaded = await getUserData(eid);
    } catch (e) {
        console.error("Error loading user data:", e);
        errorMsg.value = String(e);
    }

    isLoadingEID.value = false;

    if (loaded) {
        userData.value = loaded;
        if (!checkSID(eid)) {
            localStorage.setItem('player-eid', eid);
            localStorage.setItem('user-data', JSON.stringify(loaded));
        }
    }
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

#eid input.concealed:not(:placeholder-shown) {
    color: transparent;
    text-shadow: 0 0 .5em var(--text-color);
    text-align: center;
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


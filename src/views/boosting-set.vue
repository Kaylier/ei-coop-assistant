<template>
    <load-eid :userData="userData" @onloaded="(x: T.UserData) => userData = x"></load-eid>
    <section class="settings">
        <setting-switch id="deflector-mode"
                        v-model="deflectorSetting"
                        label="Deflector"
                        tooltip="Include a deflector in your sets"
                        :options="[
                                  { value: false, label: 'no' },
                                  { value: true, label: 'yes' },
                                  ]"/>
        <setting-switch id="ship-mode"
                        v-model="shipSetting"
                        label="Ship in a Bottle"
                        tooltip="Include a ship in a bottle in your sets"
                        :options="[
                                  { value: false, label: 'no' },
                                  { value: true, label: 'yes' },
                                  ]"/>
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
        <setting-switch id="online"
                        v-model="onlineSetting"
                        :options="[
                                  { value: false, label: 'offline' },
                                  { value: true, label: 'online' },
                                  ]"/>
    </section>

    <pre v-if="errorMessage" class="invalid-text" style="white-space:preserve">{{ errorMessage }}</pre>

    <section v-if="!errorMessage" class="main-sets">

        <artifact-set-card v-if="setDili"
            title="Dilithium set"
            description="Equip when starting boosts</br>to extend their durations."
            :set="setDili"
            :userData="userData"
            :stats="['dili']"
            :substats="['ihr']"
            />
        <artifact-set-card v-if="setIHR"
            title="IHR set"
            description="Equip when boosting</br>with tachyon prisms."
            :set="setIHR"
            :userData="userData"
            :stats="['ihr']"
            :substats="['hab', 'lay']"
            />
        <artifact-set-card v-if="setSlow"
            title="Slow-boost set"
            description="Equip when using large tachyons</br>to maximize your contribution."
            :set="setSlow"
            :userData="userData"
            :stats="['lay', 'ihr']"
            :substats="['hab']"
            />

    </section>
</template>

<style scoped src="@/styles/earning-set.css"></style>

<script setup lang="ts">
import { ref, shallowRef, watch } from 'vue';
import * as T from '@/scripts/types.ts';
import { formatNumber } from '@/scripts/utils.ts';
import { createSwitchSetting } from '@/scripts/settings.ts';
import { searchDiliSet, searchIHRSet, searchSlowIHRSet } from '@/scripts/boosting-set.ts';




// Settings variables
const deflectorSetting = createSwitchSetting<boolean>({
    localStorageKey: 'boosting-deflector',
    defaultValue: false,
});
const shipSetting = createSwitchSetting<boolean>({
    localStorageKey: 'boosting-ship',
    defaultValue: false,
});
const reslottingSetting = createSwitchSetting<boolean>({
    localStorageKey: 'allow-reslotting',
    defaultValue: false,
});
const onlineSetting = createSwitchSetting<boolean>({
    localStorageKey: 'online',
    defaultValue: false,
});



// State variables
const errorMessage = ref<string>("");



// Data variables
const userData = shallowRef<T.UserData>(null); // loaded via load-eid component
const setDili = shallowRef<T.ArtifactSet|null>();
const setIHR  = shallowRef<T.ArtifactSet|null>();
const setSlow = shallowRef<T.ArtifactSet|null>();



// Watchers for synchronisation between setting variables, local storage and state variables

watch(userData, () => {
    if (!userData.value) return;
    localStorage.setItem('user-data', JSON.stringify(userData.value));
});


// Watchers for triggering recomputations
watch(userData, updateSet);
watch(deflectorSetting, updateSet);
watch(shipSetting, updateSet);
watch(reslottingSetting, updateSet);
watch(onlineSetting, updateSet);


/**
 * Find the optimal sets and populate view entries
 */
function updateSet() {
    if (!userData.value) return [];
    console.log("Update sets");

    const maxSlot: number = userData.value?.proPermit ? 4 : 2;

    try {
        errorMessage.value = "";
        setDili.value = searchDiliSet(userData.value?.items ?? [],
                                      maxSlot,
                                      false, // include deflector
                                      false, // include ship
                                      reslottingSetting.value);
        console.log("Dili set:", setDili.value);
        setIHR.value = searchIHRSet(userData.value?.items ?? [],
                                    maxSlot,
                                    deflectorSetting.value,
                                    shipSetting.value,
                                    reslottingSetting.value);
        console.log("IHR set:", setIHR.value);
        setSlow.value = searchSlowIHRSet(userData.value?.items ?? [],
                                         maxSlot,
                                         deflectorSetting.value,
                                         shipSetting.value,
                                         reslottingSetting.value);
        console.log("Slow-IHR set:", setSlow.value);

    } catch (e) {
        errorMessage.value = "An error occured.\nTry to clear your browser cache and reload your inventory.\nIf the error persist, contact the developper.\n\n"+(e instanceof Error ? e.message : String(e));
        setDili.value = null;
        setIHR.value = null;
        setSlow.value = null;
        return;
    }
}


</script>

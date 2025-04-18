<template>
    <load-eid :userData="userData" @onloaded="(x: T.UserData) => userData = x"></load-eid>
    <section class="settings">
        <setting-switch id="deflector-mode"
                        v-model="deflectorSetting"
                        label="Deflector"
                        tooltip="Include a deflector in your IHR sets"
                        :options="[
                                  { value: false, label: 'no' },
                                  { value: true, label: 'yes' },
                                  ]"/>
        <setting-switch id="ship-mode"
                        v-model="shipSetting"
                        label="Ship in a Bottle"
                        tooltip="Include a ship in a bottle in your IHR sets"
                        :options="[
                                  { value: false, label: 'no' },
                                  { value: true, label: 'yes' },
                                  ]"/>
        <setting-switch id="reslotting"
                        v-model="reslottingSetting"
                        label="Reslotting"
                        tooltip="Allow reslotting stones in artifacts<br/>
                                 Stone-holder artifacts are interchangeable and<br/>
                                 stones may be arbitrarily rearranged"
                        :options="[
                                  { value: false, label: 'no' },
                                  { value: true, label: 'yes' },
                                  ]"/>
        <setting-switch v-if="showExtraSettings || showExtraSettingGusset"
                        id="gusset"
                        v-model="allowedGussetSetting"
                        label="Gusset"
                        tooltip="Force to use a specific gusset in your IHR sets<br/>
                                 Disabled on 'any'"
                        :options="allowedGussetChoices.map(x => ({ value: x}))">
            <template #option="{ value: gusset }">
                <span v-if="gusset === T.AllowedGusset.ANY">any</span>
                <span v-else-if="gusset === T.AllowedGusset.NONE">Ø</span>
                <img v-else :src="getGussetImage(gusset)"
                            :alt="getGussetName(gusset)"
                            :class="getGussetClass(gusset)"/>
            </template>
            <template #extra>
                <button v-if="allowedGussetChoices.length < 10"
                   href="#"
                   class="switch-option extra-gusset-button"
                   @click="allowedGussetChoices = Object.values(T.AllowedGusset)">
                    …
                </button>
            </template>
        </setting-switch>
        <setting-switch v-if="showExtraSettings || showExtraSettingOnline"
                        id="online"
                        v-model="onlineSetting"
                        tooltip="Enables Internal Hatchery Calm if offline"
                        :options="[
                                  { value: false, label: 'offline' },
                                  { value: true, label: 'online' },
                                  ]"/>
        <setting-text v-if="showExtraSettings || showExtraSettingCapacity"
                      id="hab-capacity"
                      v-model="capacitySetting"
                      label="Hab capacity"
                      tooltip="Capacity of your habs</br>
                               Empty for automatic"/>
        <a href='#' v-if="!showExtraSettings" @click="showExtraSettings = true;">
            more settings
        </a>
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

    <section v-if="!errorMessage" class="boost-sets">

        <boost-set-card
            :boosts="[{ id: T.Boost.TACHYON_100X120, amount: 2 }]"
            :ihr="baseIHR*ihrBonus" :dili="diliBonus" :maxPopulation="habCapacity"/>
        <boost-set-card
            :boosts="[{ id: T.Boost.TACHYON_100X120 }, { id: T.Boost.BOOST_2X30 , amount: 3}]"
            :ihr="baseIHR*ihrBonus" :dili="diliBonus" :maxPopulation="habCapacity"/>
        <boost-set-card
            :boosts="[{ id: T.Boost.TACHYON_1000X60 }]"
            :ihr="baseIHR*ihrBonus" :dili="diliBonus" :maxPopulation="habCapacity"/>
        <boost-set-card
            :boosts="[{ id: T.Boost.TACHYON_1000X60 }, { id: T.Boost.BOOST_2X30}]"
            :ihr="baseIHR*ihrBonus" :dili="diliBonus" :maxPopulation="habCapacity"/>
        <boost-set-card
            :boosts="[{ id: T.Boost.TACHYON_1000X10 }, { id: T.Boost.BOOST_2X30}]"
            :ihr="baseIHR*ihrBonus" :dili="diliBonus" :maxPopulation="habCapacity"/>
        <boost-set-card
            :boosts="[{ id: T.Boost.TACHYON_1000X10 }, { id: T.Boost.BOOST_2X30, amount: 2}]"
            :ihr="baseIHR*ihrBonus" :dili="diliBonus" :maxPopulation="habCapacity"/>
        <boost-set-card
            :boosts="[{ id: T.Boost.TACHYON_1000X10 }, { id: T.Boost.BOOST_10X10}]"
            :ihr="baseIHR*ihrBonus" :dili="diliBonus" :maxPopulation="habCapacity"/>

    </section>
</template>

<style scoped src="@/styles/boosting-set.css"></style>

<script setup lang="ts">
import { ref, shallowRef, computed, watch, onMounted } from 'vue';
import * as T from '@/scripts/types.ts';
import { formatNumber, parseNumber } from '@/scripts/utils.ts';
import { createSwitchSetting, createTextInputSetting } from '@/scripts/settings.ts';
import { searchDiliSet, searchIHRSet, searchSlowIHRSet } from '@/scripts/boosting-set.ts';
import { getOptimalGussets } from '@/scripts/laying-set.ts';


const DEFAULT_HAB_CAPACITY = 11340000000;

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
const allowedGussetSetting = createSwitchSetting<T.AllowedGusset>({
    localStorageKey: 'allowed-gusset',
    defaultValue: T.AllowedGusset.ANY,
});
const onlineSetting = createSwitchSetting<boolean>({
    localStorageKey: 'online',
    defaultValue: false,
});
const capacitySetting = createTextInputSetting<number|null>({
    localStorageKey: 'hab-capacity',
    defaultValue: DEFAULT_HAB_CAPACITY,
    parser: (s: string) => s ? parseNumber(s) : null,
    formatter: (x: number|null): string => formatNumber(x ?? habCapacity.value),
});



// State variables
const showExtraSettings = ref<boolean>(false);
const showExtraSettingGusset = ref<boolean>(false);
const showExtraSettingOnline = ref<boolean>(false);
const showExtraSettingCapacity = ref<boolean>(false);
const errorMessage = ref<string>("");
const allowedGussetChoices = ref<T.AllowedGusset[]>([T.AllowedGusset.ANY]);
const diliBonus = computed(() => setDili.value?.effects.get('boost_duration_bonus') ?? 1);
const baseIHR = computed(() => (userData.value?.baseIHRate ?? 7440)*
                               (onlineSetting.value ? 1 : userData.value?.awayIHBonus ?? 1));
const ihrBonus = computed(() => (setIHR.value?.effects.get('internal_hatchery_bonus') ?? 1)*
                                (setIHR.value?.effects.get('boost_bonus') ?? 1));
const slowihrBonus = computed(() => (setSlow.value?.effects.get('internal_hatchery_bonus') ?? 1)*
                                    (setSlow.value?.effects.get('boost_bonus') ?? 1));


// Data variables
const userData = shallowRef<T.UserData>(null); // loaded via load-eid component
const setDili = shallowRef<T.ArtifactSet|null>();
const setIHR  = shallowRef<T.ArtifactSet|null>();
const setSlow = shallowRef<T.ArtifactSet|null>();
const habCapacity = computed<number>(() => {
    if (capacitySetting.value) return capacitySetting.value;
    const caps = {
        [T.AllowedGusset.ANY ]: null,
        [T.AllowedGusset.NONE]: 11340000000*1.00,
        [T.AllowedGusset.T1C ]: 11340000000*1.05,
        [T.AllowedGusset.T2C ]: 11340000000*1.10,
        [T.AllowedGusset.T2E ]: 11340000000*1.12,
        [T.AllowedGusset.T3C ]: 11340000000*1.15,
        [T.AllowedGusset.T3R ]: 11340000000*1.16,
        [T.AllowedGusset.T4C ]: 11340000000*1.20,
        [T.AllowedGusset.T4E ]: 11340000000*1.22,
        [T.AllowedGusset.T4L ]: 11340000000*1.25,
    };
    return caps[allowedGussetSetting.value] ??
           caps[allowedGussetChoices.value.at(-1)!] ?? // ANY is guaranteed to always be in allowedGussetChoices
           DEFAULT_HAB_CAPACITY;
});


onMounted(async () => {
    showExtraSettingGusset.value = allowedGussetSetting.value !== T.AllowedGusset.ANY;
    showExtraSettingOnline.value = onlineSetting.value !== false;
    showExtraSettingCapacity.value = !!capacitySetting.text;
});

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
watch(allowedGussetSetting, updateSet);
watch(onlineSetting, updateSet);


/**
 * Update default gussets shown to the user
 */
function updateAllowedGussets() {
    const choices = [T.AllowedGusset.ANY, T.AllowedGusset.NONE,
                     ...getOptimalGussets(userData.value?.items ?? [], !reslottingSetting.value)];
    if (!choices.includes(allowedGussetSetting.value)) {
        choices.push(allowedGussetSetting.value);
    }
    allowedGussetChoices.value = choices.sort();
}


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
                                      reslottingSetting.value,
                                      T.AllowedGusset.ANY);
        console.log("Dili set:", setDili.value);
        setIHR.value = searchIHRSet(userData.value?.items ?? [],
                                    maxSlot,
                                    deflectorSetting.value,
                                    shipSetting.value,
                                    reslottingSetting.value,
                                    allowedGussetSetting.value);
        console.log("IHR set:", setIHR.value);
        setSlow.value = searchSlowIHRSet(userData.value?.items ?? [],
                                         maxSlot,
                                         deflectorSetting.value,
                                         shipSetting.value,
                                         reslottingSetting.value,
                                         allowedGussetSetting.value);
        console.log("Slow-IHR set:", setSlow.value);

        updateAllowedGussets();

    } catch (e) {
        errorMessage.value = "An error occured.\nTry to clear your browser cache and reload your inventory.\nIf the error persist, contact the developper.\n\n"+(e instanceof Error ? e.message : String(e));
        setDili.value = null;
        setIHR.value = null;
        setSlow.value = null;
        return;
    }
}


function getGussetName(gusset: string) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [category,family,tier,rarity] = gusset.split('-');
    return `t${tier}${"crel"[Number(rarity)]}`
}

function getGussetImage(gusset: string) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [category,family,tier,rarity] = gusset.split('-');
    return `/img/items/${category}-${family}-${tier}.png`
}

function getGussetClass(gusset: string) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [category,family,tier,rarity] = gusset.split('-');
    return ["common", "rare", "epic", "legendary"][Number(rarity)];
}

</script>

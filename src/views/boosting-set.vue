<template>
    <load-eid :userData="userData" @onloaded="(x: T.UserData) => userData = x"></load-eid>
    <section class="settings">
        <setting-switch id="includes"
                        v-model="includesSetting"
                        label="Including"
                        tooltip="Include a Deflector and/or a Ship in a Bottle<br/>in your IHR sets"
                        type="checkbox"
                        :options="[
                                  { value: 'Deflector', img: '/img/items/artifact-tachyon_deflector-3.png' },
                                  { value: 'SiaB', img: '/img/items/artifact-ship_in_a_bottle-3.png' },
                                  ]">
            <template #option="{ value, img }">
                <img :src="img" :alt="value"/>
            </template>
        </setting-switch>
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
                        v-model="ihcSetting"
                        tooltip="Offline enables Internal Hatchery Calm"
                        :options="[
                                  { value: true, label: 'offline' },
                                  { value: false, label: 'online' },
                                  ]"/>
        <setting-text v-if="showExtraSettings || showExtraSettingCapacity"
                      id="hab-capacity"
                      v-model="capacitySetting"
                      label="Hab capacity"
                      tooltip="Maximum capacity of your habs</br>
                               used in boost sets</br>
                               Leave empty for automatic"/>
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
            >
            <span>
                <img v-for="i in 5" src="/img/boosts/tachyon_10x240.png" style="height: 0.75em"/>
            </span>
            <span v-for="{ population, time } in slowIHRMilestones">
                <span class="highlighted">{{ formatNumber(population) }}</span>
                chickens after
                <span class="highlighted">{{ formatTime(time) }}</span>
            </span>
        </artifact-set-card>

    </section>

    <section v-if="!errorMessage" class="boost-sets">

        <boost-set-card v-for="{ id, boosts } in shownBoostSets"
                        :key="id"
                        :boosts="boosts"
                        :ihr="baseIHR*ihrBonus"
                        :dili="diliBonus"
                        :maxPopulation="habCapacity"
                        :pinned="showAllBoostSets ? pinnedBoostSetting.value.has(id) : undefined"
                        @changed="changePin(id, $event)"
                        />
    </section>

    <div id="show-all-boosts">
        <a href="#" @click="showAllBoostSets = !showAllBoostSets">
            {{ showAllBoostSets ? 'only show favourite boost sets' : 'select favourite boost sets' }}
        </a>
    </div>
</template>

<style scoped src="@/styles/boosting-set.css"></style>

<script setup lang="ts">
import { ref, shallowRef, computed, watch, onMounted } from 'vue';
import * as T from '@/scripts/types.ts';
import { formatNumber, parseNumber, formatTime } from '@/scripts/utils.ts';
import { createSetting, createTextInputSetting } from '@/scripts/settings.ts';
import { boostSets, searchDiliSet, searchIHRSet, searchSlowIHRSet } from '@/scripts/boosting-set.ts';
import { getOptimalGussets } from '@/scripts/laying-set.ts';


const DEFAULT_HAB_CAPACITY = 11340000000;


const includesSetting = createSetting<string[]>({
    localStorageKey: 'boosting-includes',
    defaultValue: [],
});
const reslottingSetting = createSetting<boolean>({
    localStorageKey: 'allow-reslotting',
    defaultValue: false,
});
const allowedGussetSetting = createSetting<T.AllowedGusset>({
    localStorageKey: 'allowed-gusset',
    defaultValue: T.AllowedGusset.ANY,
});
const ihcSetting = createSetting<boolean>({
    localStorageKey: 'ihc-enabled',
    defaultValue: true,
});
const capacitySetting = createTextInputSetting<number|null>({
    localStorageKey: 'hab-capacity',
    defaultValue: DEFAULT_HAB_CAPACITY,
    parser: (s: string) => s ? parseNumber(s) : null,
    formatter: (x: number|null): string => formatNumber(x ?? habCapacity.value),
});
const pinnedBoostSetting = createSetting<Set<string>>({
    localStorageKey: 'pinned-boost-sets',
    defaultValue: new Set([...boostSets.entries()].filter(([,x]) => x.default).map(([k,]) => k)),
    parser: (s: string) => new Set(JSON.parse(s)),
    formatter: (x: Set<string>) => JSON.stringify([...x]),
});

function changePin(id: string, checked: boolean) {
    if (checked) {
        pinnedBoostSetting.value.add(id);
    } else {
        pinnedBoostSetting.value.delete(id);
    }
    // Force triggering the ref
    pinnedBoostSetting.value = new Set(pinnedBoostSetting.value);
}


const showExtraSettings = ref<boolean>(false);
const showExtraSettingGusset = ref<boolean>(false);
const showExtraSettingOnline = ref<boolean>(false);
const showExtraSettingCapacity = ref<boolean>(false);
const errorMessage = ref<string>("");
const allowedGussetChoices = ref<T.AllowedGusset[]>([T.AllowedGusset.ANY]);
const diliBonus = computed(() => setDili.value?.effects.get('boost_duration_bonus') ?? 1);
const baseIHR = computed(() => (userData.value?.baseIHRate ?? 7440)*
                               (ihcSetting.value ? userData.value?.awayIHBonus ?? 1 : 1));
const ihrBonus = computed(() => (setIHR.value?.effects.get('internal_hatchery_bonus') ?? 1)*
                                (setIHR.value?.effects.get('boost_bonus') ?? 1));

const slowIHRMilestones = computed(() => {
    const ihrbonus = (setSlow.value?.effects.get('internal_hatchery_bonus') ?? 1)*
                     (setSlow.value?.effects.get('boost_bonus') ?? 1);
    return [
        { population: baseIHR.value*ihrbonus*60*10*diliBonus.value, time: 60*10*diliBonus.value },
        { population: baseIHR.value*ihrbonus*60*240*diliBonus.value, time: 60*240*diliBonus.value },
    ];
});

const showAllBoostSets = ref<boolean>(false);
const shownBoostSets = computed(() => {
    const ret = [];
    for (const id of (showAllBoostSets.value ? boostSets.keys() : pinnedBoostSetting.value)) {
        const x = boostSets.get(id);
        if (!x) continue;
        if (userData.value?.proPermit ? !x.proPermit : !x.freePermit) continue;
        ret.push({ id, boosts: x.boosts });
    }
    return ret;
});


const userData = shallowRef<T.UserData>(null); // loaded via load-eid component
const setDili = shallowRef<T.ArtifactSet|null>();
const setIHR  = shallowRef<T.ArtifactSet|null>();
const setSlow = shallowRef<T.ArtifactSet|null>();
const habCapacity = computed<number>(() => {
    if (capacitySetting.value) return capacitySetting.value;
    if (setIHR.value) return DEFAULT_HAB_CAPACITY*setIHR.value.effects.get('hab_capacity_bonus');
    const caps = {
        [T.AllowedGusset.ANY ]: null,
        [T.AllowedGusset.NONE]: DEFAULT_HAB_CAPACITY*1.00,
        [T.AllowedGusset.T1C ]: DEFAULT_HAB_CAPACITY*1.05,
        [T.AllowedGusset.T2C ]: DEFAULT_HAB_CAPACITY*1.10,
        [T.AllowedGusset.T2E ]: DEFAULT_HAB_CAPACITY*1.12,
        [T.AllowedGusset.T3C ]: DEFAULT_HAB_CAPACITY*1.15,
        [T.AllowedGusset.T3R ]: DEFAULT_HAB_CAPACITY*1.16,
        [T.AllowedGusset.T4C ]: DEFAULT_HAB_CAPACITY*1.20,
        [T.AllowedGusset.T4E ]: DEFAULT_HAB_CAPACITY*1.22,
        [T.AllowedGusset.T4L ]: DEFAULT_HAB_CAPACITY*1.25,
    };
    return caps[allowedGussetSetting.value] ??
           caps[allowedGussetChoices.value.at(-1)!] ?? // ANY is guaranteed to always be in allowedGussetChoices
           DEFAULT_HAB_CAPACITY;
});


onMounted(async () => {
    showExtraSettingGusset.value = allowedGussetSetting.value !== T.AllowedGusset.ANY;
    showExtraSettingOnline.value = ihcSetting.value !== true;
    showExtraSettingCapacity.value = !!capacitySetting.text;
});


watch(userData, () => {
    if (!userData.value) return;
    localStorage.setItem('user-data', JSON.stringify(userData.value));
});


watch(userData, updateSet);
watch(includesSetting, updateSet);
watch(reslottingSetting, updateSet);
watch(allowedGussetSetting, updateSet);
watch(ihcSetting, updateSet);


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
                                    includesSetting.value.includes('Deflector'),
                                    includesSetting.value.includes('SiaB'),
                                    reslottingSetting.value,
                                    allowedGussetSetting.value);
        console.log("IHR set:", setIHR.value);
        setSlow.value = searchSlowIHRSet(userData.value?.items ?? [],
                                         maxSlot,
                                         includesSetting.value.includes('Deflector'),
                                         includesSetting.value.includes('SiaB'),
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

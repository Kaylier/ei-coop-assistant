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
        <setting-switch id="swapping"
                        v-model="swappingSetting"
                        label="Gusset swapping"
                        tooltip="Allow swapping gusset mid-boost<br/>
                                 for a higher IHR at lower population"
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
        <a href='#' v-if="!showExtraSettings" @click="showExtraSettings = true;">
            more settings
        </a>
    </section>

    <pre v-if="errorMessage" class="invalid-text" style="white-space:preserve">{{ errorMessage }}</pre>

    <a class="quick-link smartphone-only" href="#boost-sets">go to boost sets</a>

    <section v-if="!errorMessage" id="main-sets">

        <artifact-set-card v-if="setDili"
            title="Dilithium set"
            description="Equip when starting boosts</br>to extend their durations."
            :set="setDili"
            :userData="userData"
            :stats="['dili']"
            :substats="['ihr']"
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
                <img v-for="_ in 5" src="/img/boosts/tachyon_10x240.png" style="height: 0.75em"/>
            </span>
            <span v-for="{ population, time } in slowIHRMilestones">
                <span class="highlighted">{{ formatNumber(population) }}</span>
                chickens after
                <span class="highlighted">{{ formatTime(time) }}</span>
            </span>
        </artifact-set-card>
        <artifact-set-card v-for="set of setIHR"
            title="IHR set"
            description="Equip when boosting</br>with tachyon prisms."
            :set="set"
            :userData="userData"
            :stats="['ihr']"
            :substats="['hab', 'lay']"
            />

    </section>

    <section v-if="!errorMessage" id="boost-sets">

        <boost-set-card v-for="{ id, boosts } in shownBoostSets"
                        :key="id"
                        :boosts="boosts"
                        :dili="diliBonus"
                        :stats="boostSetCardStats"
                        :pinned="showAllBoostSets ? pinnedBoostSetting.value.has(id) : undefined"
                        @changed="changePin(id, $event)"
                        />
    </section>

    <a href="#boost-sets"
       class="quick-link"
       @click="showAllBoostSets = !showAllBoostSets">
        {{ showAllBoostSets ? 'only show favourite boost sets' : 'select favourite boost sets' }}
    </a>
</template>

<style scoped src="@/styles/boosting-set.css"></style>

<script setup lang="ts">
import { ref, shallowRef, computed, watch, onMounted } from 'vue';
import * as T from '@/scripts/types.ts';
import { formatNumber, formatTime } from '@/scripts/utils.ts';
import { createSetting } from '@/scripts/settings.ts';
import { boostSets, searchDiliSet, searchIHRSets, searchSlowIHRSet } from '@/scripts/boosting-set.ts';
import { getOptimalGussets } from '@/scripts/laying-set.ts';



const includesSetting = createSetting<string[]>({
    localStorageKey: 'boosting-includes',
    defaultValue: [],
});
const reslottingSetting = createSetting<boolean>({
    localStorageKey: 'allow-reslotting',
    defaultValue: false,
});
const swappingSetting = createSetting<boolean>({
    localStorageKey: 'gusset-swapping',
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
const errorMessage = ref<string>("");
const allowedGussetChoices = ref<T.AllowedGusset[]>([T.AllowedGusset.ANY]);
const diliBonus = computed(() => setDili.value?.effects.get('boost_duration_bonus') ?? 1);
const baseIHR = computed(() => (userData.value?.baseIHRate ?? 7440*4)*
                               (ihcSetting.value ? userData.value?.awayIHBonus ?? 3 : 1));
const baseHabCapacity = computed(() => 11340000000); // TODO: read from userData
const boostSetCardStats = computed(() => {
    const ret = [];
    for (const set of setIHR.value) {
        const ihr = baseIHR.value*set.effects.get('internal_hatchery_bonus')*set.effects.get('boost_bonus');
        const habCapacity = baseHabCapacity.value*set.effects.get('hab_capacity_bonus');
        ret.push({ ihr, habCapacity });
    }
    if (ret.length === 0) {
        ret.push({ ihr: baseIHR.value, habCapacity: baseHabCapacity.value });
    }
    return ret;
});

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
const setIHR  = shallowRef<T.ArtifactSet[]>([]);
const setSlow = shallowRef<T.ArtifactSet|null>();


onMounted(async () => {
    showExtraSettingGusset.value = allowedGussetSetting.value !== T.AllowedGusset.ANY;
    showExtraSettingOnline.value = ihcSetting.value !== true;
});


watch(userData, () => {
    if (!userData.value) return;
    localStorage.setItem('user-data', JSON.stringify(userData.value));
});


watch(userData, updateSet);
watch(includesSetting, updateSet);
watch(reslottingSetting, updateSet);
watch(swappingSetting, updateSet);
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
        updateAllowedGussets();

        setDili.value = searchDiliSet(userData.value?.items ?? [],
                                      maxSlot,
                                      false, // include deflector
                                      false, // include ship
                                      reslottingSetting.value,
                                      T.AllowedGusset.ANY);
        console.log("Dili set:", setDili.value);
        const targetGusset = swappingSetting.value && allowedGussetSetting.value === T.AllowedGusset.ANY ?
                             allowedGussetChoices.value.at(-1) ?? T.AllowedGusset.NONE : allowedGussetSetting.value;
        setIHR.value = searchIHRSets(userData.value?.items ?? [],
                                     maxSlot,
                                     includesSetting.value.includes('Deflector'),
                                     includesSetting.value.includes('SiaB'),
                                     reslottingSetting.value,
                                     targetGusset);
        if (swappingSetting.value === false) {
            setIHR.value = setIHR.value.slice(-1);
        }
        console.log("IHR sets:", ...setIHR.value);
        setSlow.value = searchSlowIHRSet(userData.value?.items ?? [],
                                         maxSlot,
                                         includesSetting.value.includes('Deflector'),
                                         includesSetting.value.includes('SiaB'),
                                         reslottingSetting.value,
                                         allowedGussetSetting.value);
        console.log("Slow-IHR set:", setSlow.value);


    } catch (e) {
        errorMessage.value = "An error occured.\nTry to clear your browser cache and reload your inventory.\nIf the error persist, contact the developper.\n\n"+(e instanceof Error ? e.message : String(e));
        setDili.value = null;
        setIHR.value = [];
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

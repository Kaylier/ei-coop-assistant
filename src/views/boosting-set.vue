<template>
    <load-eid v-model="userData"/>
    <section class="settings">
        <setting-switch id="includes"
                        v-model="includesSetting"
                        label="Including"
                        tooltip="Include a Deflector and/or a Ship in a Bottle<br/>in your IHR sets"
                        type="checkbox"
                        :options="[
                                  { value: T.ArtifactFamily.TACHYON_DEFLECTOR, label: 'Deflector',
                                    img: '/img/items/artifact-tachyon_deflector-3.png' },
                                  { value: T.ArtifactFamily.SHIP_IN_A_BOTTLE, label: 'Ship in a Bottle',
                                    img: '/img/items/artifact-ship_in_a_bottle-3.png' },
                                  ]"/>
        <setting-switch id="reslotting"
                        v-model="reslottingSetting"
                        label="Reslotting"
                        tooltip="Allow reslotting stones in artifacts<br/>
                                 Stone-holder artifacts are interchangeable and<br/>
                                 stones may be arbitrarily rearranged.<br/>
                                 Select 'add' to keep already slotted stones."
                        :options="[
                                  { value: 0, label: 'no' },
                                  { value: 1, label: 'add' },
                                  { value: 3, label: 'swap' },
                                  ]"/>
        <setting-switch id="swapping"
                        v-model="swappingSetting"
                        label="Gusset swapping"
                        tooltip="Allow swapping gusset mid-boost<br/>
                                 for a higher IHR at lower population<br/>
                                 Select deflector or ship in a bottle<br/>
                                 to allow them to be replaced."
                        :options="swappingOptions"/>
        <setting-switch :hide="!showExtraSettings"
                        id="gusset"
                        v-model="allowedGussetSetting"
                        label="Gusset"
                        tooltip="Target a specific gusset with your IHR sets<br/>
                                 If swapping is enabled, this is the highest gusset<br/>
                                 Disabled on 'any'"
                        :options="allowedGussetOptions"
                        @focusin="allowedGussetOptionsAll = allowedGussetOptionsAll"
                        @focusout="allowedGussetOptionsAll = false">
            <template #option="{ label, img, cls }">
                <img v-if="img" :src="img" :alt="label" :class="cls"/>
                <span v-else v-html="label"/>
            </template>
            <template #extra>
                <button v-if="allowedGussetOptions.length < 10"
                   href="#"
                   class="switch-option extra-gusset-button"
                   @click="allowedGussetOptionsAll = true">
                    …
                </button>
            </template>
        </setting-switch>
        <setting-switch :hide="!showExtraSettings"
                        id="online"
                        v-model="ihcSetting"
                        tooltip="Offline enables Internal Hatchery Calm"
                        :options="[
                                  { value: true, label: 'offline' },
                                  { value: false, label: 'online' },
                                  ]"/>
        <setting-switch :hide="!showExtraSettings"
                        id="duration-bonus"
                        v-model="durationBonusSetting"
                        label="Boost duration"
                        :options="[
                                  { value: 1, label: '×1' },
                                  { value: 2, label: '×2' },
                                  ]"/>
        <setting-text :hide="!showExtraSettings"
                      id="starting-population"
                      v-model="startingPopulationSetting"
                      label="Starting population"/>
        <a href='#' v-if="!showExtraSettings" @click="showExtraSettings = true;">
            more settings
        </a>
    </section>

    <pre v-if="errorMessage" class="invalid-text" style="white-space:preserve">{{ errorMessage }}</pre>

    <a class="quick-link smartphone-only" href="#boost-sets">go to boost sets</a>

    <section v-if="!errorMessage && userData" id="main-sets">

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
            :boosts="[T.BoostCategory.TACHYON_PRISM]"
            >
            <span>
                <img v-for="_ in 5" src="/img/boosts/tachyon_10x240.png" style="height: 0.75em"/>
            </span>
            <span v-for="{ population, time } in slowIHRMilestones">
                <span class="highlighted">+{{ formatNumber(population) }}</span>
                chickens after
                <span class="highlighted">{{ formatTime(time) }}</span>
            </span>
        </artifact-set-card>
        <span v-else class="invalid-text">
            You don't have enough artifacts<br/>
            to build a Slow-boost set<br/>
            with the selected constraints
        </span>
        <artifact-set-card v-for="set, i of setIHR" :key="JSON.stringify(set)"
            :title="setIHR.length > 1 ? `IHR set ${i+1}/${setIHR.length}` : 'IHR set'"
            description="Equip when boosting</br>with tachyon prisms."
            :set="set"
            :userData="userData"
            :stats="['ihr']"
            :substats="['hab', 'lay']"
            :boosts="[T.BoostCategory.TACHYON_PRISM]"
            >
            <template v-if="i === 0">
            <span>
                <img v-for="_ in 5" src="/img/boosts/tachyon_10x240.png" style="height: 0.75em"/>
            </span>
            <span v-for="{ population, time } in IHRMilestones">
                <span class="highlighted">+{{ formatNumber(population) }}</span>
                chickens after
                <span class="highlighted">{{ formatTime(time) }}</span>
            </span>
            </template>
        </artifact-set-card>
        <span v-if="setIHR.length === 0" class="invalid-text">
            You don't have enough artifacts<br/>
            to build an IHR set<br/>
            with the selected constraints
        </span>

    </section>

    <section v-if="!errorMessage" id="boost-sets">

        <boost-set-card v-for="{ id, boosts } in shownBoostSets"
                        :key="id"
                        :boosts="boosts"
                        :dili="durationBonus"
                        :stats="boostSetCardStats"
                        :startPopulation="startingPopulationSetting.value"
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
import { ref, shallowRef, computed, watch } from 'vue';
import * as T from '@/scripts/types.ts';
import { parseNumber, formatNumber, formatTime, spinNumber } from '@/scripts/utils.ts';
import { createSetting, createTextInputSetting, focusRef } from '@/scripts/settings.ts';
import { Effects } from '@/scripts/effects.ts';
import { boostSets, searchDiliSet, searchIHRSets, searchSlowIHRSet } from '@/scripts/boosting-set.ts';
import { getOptimalGussets } from '@/scripts/laying-set.ts';



const includesSetting = createSetting<(T.ArtifactFamily)[]>({
    localStorageKey: 'boosting-including',
    defaultValue: [],
    parser: (s) => (JSON.parse(s) as T.ArtifactFamily[]).filter(x =>
                    x === T.ArtifactFamily.TACHYON_DEFLECTOR || x === T.ArtifactFamily.SHIP_IN_A_BOTTLE),
});
const reslottingSetting = createSetting<0|1|2|3>({
    localStorageKey: 'boosting-reslotting',
    defaultValue: 0,
});
const swappingSetting = createSetting<null|T.ArtifactFamily[]>({
    localStorageKey: 'boosting-gusset-swap',
    defaultValue: null,
    parser: (s) => (JSON.parse(s) as T.ArtifactFamily[])?.filter(x =>
                    x === T.ArtifactFamily.TACHYON_DEFLECTOR || x === T.ArtifactFamily.SHIP_IN_A_BOTTLE) ?? null,
});
const allowedGussetSetting = createSetting<T.AllowedGusset>({
    localStorageKey: 'boosting-gusset-target',
    defaultValue: T.AllowedGusset.ANY,
});
const ihcSetting = createSetting<boolean>({
    localStorageKey: 'boosting-offline',
    defaultValue: true,
});
const durationBonusSetting = createSetting<number>({
    localStorageKey: 'boosting-duration-bonus',
    defaultValue: 1,
});
const startingPopulationSetting = createTextInputSetting<number>({
    localStorageKey: 'boosting-starting-population',
    defaultValue: 0,
    parser: (s: string) => s ? parseNumber(s) : 0,
    formatter: formatNumber,
    spinner: spinNumber,
});
const pinnedBoostSetting = createSetting<Set<string>>({
    localStorageKey: 'boosting-favourite-boost-sets',
    defaultValue: new Set([...boostSets.entries()].filter(([,x]) => x.default).map(([k,]) => k)),
    parser: (s: string) => new Set(JSON.parse(s)),
    formatter: (x: Set<string>) => JSON.stringify([...x]),
});


const swappingOptions = computed(() => {
    const ret: {
        value: null|T.ArtifactFamily[],
        label: string,
        img?: string
    }[] = [
        { value: null, label: 'no' },
        { value: [], label: 'yes' },
    ]
    const show = (x: T.ArtifactFamily) => includesSetting.value.includes(x) ||
                                          (swappingSetting.value && swappingSetting.value.includes(x));
    if (show(T.ArtifactFamily.TACHYON_DEFLECTOR)) {
        ret.push({
            value: [T.ArtifactFamily.TACHYON_DEFLECTOR],
            label: 'Deflector',
            img: '/img/items/artifact-tachyon_deflector-3.png'
        });
    }
    if (show(T.ArtifactFamily.SHIP_IN_A_BOTTLE)) {
        ret.push({
            value: [T.ArtifactFamily.SHIP_IN_A_BOTTLE],
            label: 'Ship in a Bottle',
            img: '/img/items/artifact-ship_in_a_bottle-3.png'
        });
    }
    return ret;
});


// When true, show every possible gussets
const allowedGussetOptionsAll = focusRef(0, 500);
const allowedGussetOptions = computed(() => {
    const choices = allowedGussetOptionsAll.value ? Object.values(T.AllowedGusset) :
        [
            T.AllowedGusset.ANY,
            T.AllowedGusset.NONE,
            ...getOptimalGussets(userData.value?.items ?? [], reslottingSetting.value === 0)
        ];

    // Force selected option to show up
    if (!choices.includes(allowedGussetSetting.value)) {
        choices.push(allowedGussetSetting.value);
    }

    const ret = choices.sort().map(x => {
        if (x === T.AllowedGusset.ANY)  return { value: x, label: "any" };
        if (x === T.AllowedGusset.NONE) return { value: x, label: "Ø" };
        return { value: x, label: getGussetName(x), img: getGussetImage(x), cls: getGussetClass(x) };
    });
    return ret;
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
const errorMessage = ref<string>("");
const durationBonus = computed(() => (setDili.value?.effects.boost_duration_mult ?? 1)*durationBonusSetting.value);
const baseEffects = computed(() => userData.value?.maxedEffects ?? Effects.initial);
const boostSetCardStats = computed(() => {
    const ret = [];
    for (const set of setIHR.value) {
        const effects = new Effects(baseEffects.value, set.effects);
        ret.push({
            ihr: 60 * (ihcSetting.value ? effects.ihr_away : effects.ihr) * effects.boost_mult,
            habCapacity: effects.hab_capacity,
        });
    }
    if (ret.length === 0) {
        ret.push({
            ihr: 60 * (ihcSetting.value ? baseEffects.value.ihr_away : baseEffects.value.ihr) * baseEffects.value.boost_mult,
            habCapacity: baseEffects.value.hab_capacity
        });
    }
    return ret;
});

const IHRMilestones = computed(() => {
    const effects = new Effects(baseEffects.value);
    if (setIHR.value?.at(0)) effects.merge(setIHR.value.at(0)!.effects);
    const ihrbonus = 60 * (ihcSetting.value ? effects.ihr_away : effects.ihr) * effects.boost_mult;
    return [
        { population: ihrbonus*50*10*durationBonus.value, time: 60*10*durationBonus.value },
        { population: ihrbonus*50*240*durationBonus.value, time: 60*240*durationBonus.value },
    ];

});
const slowIHRMilestones = computed(() => {
    const effects = new Effects(baseEffects.value)
    if (setSlow.value) effects.merge(setSlow.value.effects);
    const ihrbonus = 60 * (ihcSetting.value ? effects.ihr_away : effects.ihr) * effects.boost_mult;
    return [
        { population: ihrbonus*50*10*durationBonus.value, time: 60*10*durationBonus.value },
        { population: ihrbonus*50*240*durationBonus.value, time: 60*240*durationBonus.value },
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


const userData = shallowRef<T.UserData>(); // loaded via load-eid component
const setDili = shallowRef<T.ArtifactSet|null>();
const setIHR  = shallowRef<T.ArtifactSet[]>([]);
const setSlow = shallowRef<T.ArtifactSet|null>();


watch([userData, includesSetting, reslottingSetting, swappingSetting, allowedGussetSetting, ihcSetting], updateSet);


/**
 * Find the optimal sets and populate view entries
 */
function updateSet() {
    console.log("Update sets");

    const maxSlot: number = userData.value?.proPermit ? 4 : 2;

    try {
        errorMessage.value = "";

        setDili.value = searchDiliSet(userData.value?.items ?? [],
                                      maxSlot,
                                      userData.value?.maxedEffects ?? Effects.initial,
                                      [], // no included families
                                      reslottingSetting.value,
                                      T.AllowedGusset.ANY);
        console.log("Dili set:", setDili.value);

        // If swapping is enabled, target the highest available gusset, unless one is already forced
        const targetGusset = swappingSetting.value !== null && allowedGussetSetting.value === T.AllowedGusset.ANY ?
                             allowedGussetOptions.value.at(-1)?.value ?? T.AllowedGusset.NONE :
                             allowedGussetSetting.value;
        setIHR.value = searchIHRSets(userData.value?.items ?? [],
                                     maxSlot,
                                     userData.value?.maxedEffects ?? Effects.initial,
                                     includesSetting.value,
                                     swappingSetting.value ?? [],
                                     reslottingSetting.value,
                                     targetGusset);
        // We always solve for swapping, and discard undesired sets when swapping is off
        if (swappingSetting.value === null) {
            setIHR.value = setIHR.value.slice(-1);
        }
        console.log("IHR sets:", ...setIHR.value);

        setSlow.value = searchSlowIHRSet(userData.value?.items ?? [],
                                         maxSlot,
                                         userData.value?.maxedEffects ?? Effects.initial,
                                         includesSetting.value,
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

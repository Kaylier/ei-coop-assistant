<template>
    <div class="card-frame">
        <h3>
            <label v-if="description" tabindex="0" class="tooltip-icon">
                ⓘ
                <span class="tooltip-text" v-html="description" />
            </label>
            {{ title }}
        </h3>
        <inventory-frame :artifacts="set.set" :isSet="true" :userData="userData" :column="4" :row="1" />

        <div v-for="entry of entries">
            <img v-if="entry.img" :src="entry.img" alt="🔀"/>
            <span class="highlighted" v-html="entry.valueUpd"/>
            {{ entry.text }}
            <template v-if="entry.valueNew">
                (
                <template v-if="entry.valueOld">
                    <span class="highlighted" v-html="entry.valueOld"/>
                    &rarr;
                </template>
                <span class="highlighted" v-html="entry.valueNew"/>
                )
            </template>
        </div>

        <slot/>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import * as T from '@/scripts/types.ts';
import { formatNumber } from '@/scripts/utils.ts';
import { getImageSource, getEffectDescription, getEffects } from '@/scripts/artifacts.ts';

type Entry = {
    img?: string,
    text: string,
    valueUpd: string,
    valueOld?: string,
    valueNew?: string,
    relevant?: boolean,
};

const props = defineProps<{
    title: string,
    description?: string,
    userData: T.UserData,
    set: T.ArtifactSet,
    externalCube?: T.Artifact,
    mirror?: number,
    stats?: string[], // Main stats, always shown
    substats?: string[], // Secondary stats, shown when relevant
}>();



const entries = computed(() => {
    const ret = new Map<string, Entry>();


    ret.set('eb', {
        img: props.mirror ? "/img/icons/mirror.png" : undefined,
        valueUpd: `×${formatNumber(props.mirror ?? ebMultiplier.value)}`,
        text: "EB",
        valueOld: `${formatNumber(userEB.value*100)}%`,
        valueNew: `${formatNumber(userEB.value*(props.mirror ?? ebMultiplier.value)*100)}%`,
        relevant: (props.mirror ?? ebMultiplier.value) >= 2,
    });

    ret.set('rcb', {
        text: "earnings (with rcb)",
        valueUpd: `×${formatNumber(earningMultiplier.value)}`,
        relevant: earningMultiplier.value > 1080 && earningMultiplier.value > awayEarningMultiplier.value,
    });

    ret.set('sercb', {
        text: "SE gains (with rcb)",
        valueUpd: `×${formatNumber(soulEggMultiplier.value)}`,
        relevant: soulEggMultiplier.value > 6 && soulEggMultiplier.value > awaySoulEggMultiplier.value,
    });

    ret.set('away', {
        text: "away earnings",
        valueUpd: `×${formatNumber(awayEarningMultiplier.value)}`,
        relevant: awayEarningMultiplier.value > 1080 && awayEarningMultiplier.value > earningMultiplier.value,
    });

    ret.set('seaway', {
        text: "SE gains (away)",
        valueUpd: `×${formatNumber(awaySoulEggMultiplier.value)}`,
        relevant: awaySoulEggMultiplier.value > 6 && awaySoulEggMultiplier.value > soulEggMultiplier.value,
    });

    ret.set('cr', {
        img: props.externalCube && externalCubeMult.value < props.set.effects.get('research_cost_bonus') ?
        getImageSource(props.externalCube): undefined,
        text: getEffectDescription('research_cost_bonus'),
        valueUpd: `-${formatNumber((1 - Math.min(externalCubeMult.value, props.set.effects.get('research_cost_bonus')))*100)}%`,
        relevant: externalCubeMult.value < 1 || props.set.effects.get('research_cost_bonus') < 1,
    });

    ret.set('dili', {
        text: getEffectDescription('boost_duration_bonus'),
        valueUpd: `×${formatNumber(props.set.effects.get('boost_duration_bonus'))}`,
        relevant: props.set.effects.get('boost_duration_bonus') > 1,
    });

    ret.set('ihr', {
        text: getEffectDescription('internal_hatchery_bonus'),
        valueUpd:
        `×${formatNumber(props.set.effects.get('internal_hatchery_bonus')*props.set.effects.get('boost_bonus'))}`,
        relevant: props.set.effects.get('internal_hatchery_bonus') > 1,
    });

    ret.set('hab', {
        text: getEffectDescription('hab_capacity_bonus'),
        valueUpd: `×${formatNumber(props.set.effects.get('hab_capacity_bonus'))}`,
        // TODO: get base hab capacity from userData instead
        valueNew: formatNumber(11340000000*props.set.effects.get('hab_capacity_bonus')),
        relevant: props.set.effects.get('hab_capacity_bonus') > 1,
    });

    ret.set('lay', {
        text: getEffectDescription('laying_bonus'),
        valueUpd: `×${formatNumber(props.set.effects.get('laying_bonus'))}`,
        relevant: props.set.effects.get('laying_bonus') > 1,
    });

    ret.set('ship', {
        text: getEffectDescription('shipping_bonus'),
        valueUpd: `×${formatNumber(props.set.effects.get('shipping_bonus'))}`,
        relevant: props.set.effects.get('shipping_bonus') > 1,
    });

    const stats = props.stats ?? [];
    const substats = (props.substats ?? [...ret.keys()]).filter(x => !stats.includes(x) && ret.get(x)!.relevant);
    return [...stats, ...substats].filter(x => ret.has(x)).map(x => ret.get(x)!);
});

const userEB = computed(() => {
    let eb: number = props.userData?.soulEggs ?? 0;
    eb *= props.userData?.soulEggBonus ?? 0.1;
    eb *= Math.pow(props.userData?.prophecyEggBonus ?? 1.05, props.userData?.prophecyEggs ?? 0)
    return 1 + eb;
});

const ebMultiplier = computed(() => {
    const SEBonus = props.set.effects.get('soul_egg_bonus');
    const baseSEBonus = props.userData?.soulEggBonus ?? 0.1;
    const PEBonus = props.set.effects.get('prophecy_egg_bonus');
    const basePEBonus = props.userData?.prophecyEggBonus ?? 1.05;
    const PECount = props.userData?.prophecyEggs ?? 0;
    return (1 + SEBonus/baseSEBonus)*Math.pow(1 + PEBonus/basePEBonus, PECount);
});

const earningMultiplier = computed(() => {
    const baseRCB = props.userData?.mrcbEarningBonus ?? 5;
    return props.set.effects.get('laying_bonus')
         * props.set.effects.get('egg_value_bonus')
         * (baseRCB + props.set.effects.get('running_chicken_bonus'));
});

const awayEarningMultiplier = computed(() => {
    return props.set.effects.get('laying_bonus')
         * props.set.effects.get('egg_value_bonus')
         * props.set.effects.get('away_earning_bonus');
});

const externalCubeMult = computed(() => {
    return props.externalCube ? getEffects(props.externalCube).get('research_cost_bonus') : 1;
});

const soulEggMultiplier = computed(() => {
    return Math.pow(ebMultiplier.value*earningMultiplier.value*props.set.effects.get('soul_egg_collection_bonus'), 0.21);
});

const awaySoulEggMultiplier = computed(() => {
    return Math.pow(ebMultiplier.value*awayEarningMultiplier.value*props.set.effects.get('soul_egg_collection_bonus'), 0.21);
});

</script>

<style scoped>

.card-frame {
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    gap: 0.3em;
    padding: 0.3em;
    background-color: #333333;
    border-radius: 2em 2em 1em 1em;
    font: 1.1em always-together;
    width: min(16em, 90vw);
    box-shadow: 0 0 .5em var(--bg-hover-color) inset;
}

.card-frame h3 {
    font-size: 1.3em;
    margin: 0;
}

.highlighted {
    color: color-mix(in srgb, var(--active-color) 75%, white);
    font-kerning: none;
}

img {
    height: 0.75em;
}

</style>


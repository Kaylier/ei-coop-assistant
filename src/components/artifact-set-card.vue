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
import { getImageSource, getEffects } from '@/scripts/artifacts.ts';
import { getEffectText } from '@/scripts/effects.ts';

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

    const userEB = props.userData?.maxedEffects.eb ?? 1;
    //const maxedEffects = new Effects(props.userData.maxedEffects, props.set.effects);

    ret.set('eb', {
        img: props.mirror ? "/img/icons/mirror.png" : undefined,
        valueUpd: `×${formatNumber(props.mirror ?? ebMultiplier.value)}`,
        text: "EB",
        valueOld: `${formatNumber(userEB*100)}%`,
        valueNew: `${formatNumber(userEB*(props.mirror ?? ebMultiplier.value)*100)}%`,
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
        text: "earnings (away)",
        valueUpd: `×${formatNumber(awayEarningMultiplier.value)}`,
        relevant: awayEarningMultiplier.value > 1080 && awayEarningMultiplier.value > earningMultiplier.value,
    });

    ret.set('seaway', {
        text: "SE gains (away)",
        valueUpd: `×${formatNumber(awaySoulEggMultiplier.value)}`,
        relevant: awaySoulEggMultiplier.value > 6 && awaySoulEggMultiplier.value > soulEggMultiplier.value,
    });

    ret.set('cr', {
        img: props.externalCube && externalCubeMult.value < props.set.effects.get('research_cost_mult') ?
        getImageSource(props.externalCube): undefined,
        text: getEffectText('research_cost_mult'),
        valueUpd: `-${formatNumber((1 - Math.min(externalCubeMult.value, props.set.effects.get('research_cost_mult')))*100)}%`,
        relevant: externalCubeMult.value < 1 || props.set.effects.get('research_cost_mult') < 1,
    });

    ret.set('dili', {
        text: getEffectText('boost_duration_mult'),
        valueUpd: `×${formatNumber(props.set.effects.get('boost_duration_mult'))}`,
        relevant: props.set.effects.get('boost_duration_mult') > 1,
    });

    ret.set('ihr', {
        text: getEffectText('ihr_mult'),
        valueUpd:
        `×${formatNumber(props.set.effects.get('ihr_mult')*props.set.effects.get('boost_mult'))}`,
        relevant: props.set.effects.get('ihr_mult') > 1,
    });

    ret.set('hab', {
        text: getEffectText('hab_capacity_mult'),
        valueUpd: `×${formatNumber(props.set.effects.get('hab_capacity_mult'))}`,
        // TODO: get base hab capacity from userData instead
        valueNew: formatNumber(11340000000*props.set.effects.get('hab_capacity_mult')),
        relevant: props.set.effects.get('hab_capacity_mult') > 1,
    });

    ret.set('lay', {
        text: getEffectText('laying_rate'),
        valueUpd: `×${formatNumber(props.set.effects.get('laying_rate'))}`,
        relevant: props.set.effects.get('laying_rate') > 1,
    });

    ret.set('ship', {
        text: getEffectText('shipping_mult'),
        valueUpd: `×${formatNumber(props.set.effects.get('shipping_mult'))}`,
        relevant: props.set.effects.get('shipping_mult') > 1,
    });

    const stats = props.stats ?? [];
    const substats = (props.substats ?? [...ret.keys()]).filter(x => !stats.includes(x) && ret.get(x)!.relevant);
    return [...stats, ...substats].filter(x => ret.has(x)).map(x => ret.get(x)!);
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
    return props.set.effects.get('laying_rate')
         * props.set.effects.get('egg_value_mult')
         * (baseRCB + props.set.effects.get('earning_mrcb_mult'));
});

const awayEarningMultiplier = computed(() => {
    return props.set.effects.get('laying_rate')
         * props.set.effects.get('egg_value_mult')
         * props.set.effects.get('earning_away_mult');
});

const externalCubeMult = computed(() => {
    return props.externalCube ? getEffects(props.externalCube).get('research_cost_mult') : 1;
});

const soulEggMultiplier = computed(() => {
    return Math.pow(ebMultiplier.value*earningMultiplier.value*props.set.effects.get('prestige_earning_mult'), 0.21);
});

const awaySoulEggMultiplier = computed(() => {
    return Math.pow(ebMultiplier.value*awayEarningMultiplier.value*props.set.effects.get('prestige_earning_mult'), 0.21);
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


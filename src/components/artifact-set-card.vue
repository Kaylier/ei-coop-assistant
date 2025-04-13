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

        <div v-if="(mirror && mirror > 1) || ebMultiplier > 1">
            <img v-if="mirror" src="/img/icons/mirror.png" alt="🔀"/>
            <span class="highlighted">
                ×{{ formatNumber(mirror ?? ebMultiplier) }}
            </span>
            EB
            <template v-if="userEB">
                (
                <span class="highlighted">
                    {{ formatNumber(userEB*100) }}%
                </span>
                &rarr;
                <span class="highlighted">
                    {{ formatNumber(userEB*(mirror ?? ebMultiplier)*100) }}%
                </span>
                )
            </template>
        </div>
        <div v-if="earningMultiplier > 1 && earningMultiplier >= awayEarningMultiplier">
            <span class="highlighted">
                ×{{ formatNumber(earningMultiplier) }}
            </span>
            earnings (with rcb)
        </div>
        <div v-if="awayEarningMultiplier > 1 && awayEarningMultiplier > earningMultiplier">
            <span class="highlighted">
                ×{{ formatNumber(awayEarningMultiplier) }}
            </span>
            away earnings
        </div>
        <div v-if="externalCubeMult < 1 || set.effects.get('research_cost_bonus') < 1">
            <img v-if="externalCube && externalCubeMult < set.effects.get('research_cost_bonus')"
                 :src="getImageSource(externalCube)" alt="🔀"/>
            <span class="highlighted">
                -{{ formatNumber((1 - Math.min(externalCubeMult, set.effects.get('research_cost_bonus')))*100) }}%
            </span>
            {{ getEffectDescription('research_cost_bonus') }}
        </div>

        <div v-if="set.effects.get('boost_duration_bonus') > 1">
            <span class="highlighted">
                ×{{ formatNumber(set.effects.get('boost_duration_bonus')) }}
            </span>
            {{ getEffectDescription('boost_duration_bonus') }}
        </div>
        <div v-if="set.effects.get('internal_hatchery_bonus') > 1">
            <span class="highlighted">
                ×{{ formatNumber(set.effects.get('internal_hatchery_bonus')*set.effects.get('boost_bonus')) }}
            </span>
            {{ getEffectDescription('internal_hatchery_bonus') }}
        </div>
        <div v-if="set.effects.get('hab_capacity_bonus') > 1">
            <span class="highlighted">
                ×{{ formatNumber(set.effects.get('hab_capacity_bonus')) }}
            </span>
            {{ getEffectDescription('hab_capacity_bonus') }}
        </div>
        <div v-if="set.effects.get('laying_bonus') > 1">
            <span class="highlighted">
                ×{{ formatNumber(set.effects.get('laying_bonus')) }}
            </span>
            {{ getEffectDescription('laying_bonus') }}
        </div>
        <div v-if="set.effects.get('shipping_bonus') > 1">
            <span class="highlighted">
                ×{{ formatNumber(set.effects.get('shipping_bonus')) }}
            </span>
            {{ getEffectDescription('shipping_bonus') }}
        </div>

        <slot/>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import * as T from '@/scripts/types.ts';
import { formatNumber } from '@/scripts/utils.ts';
import { getImageSource, getEffectDescription, getEffects } from '@/scripts/artifacts.ts';

const props = defineProps<{
    title: string,
    description?: string,
    userData: T.UserData,
    set: T.ArtifactSet,
    externalCube?: T.Artifact,
    mirror?: number,
}>();

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

</script>

<style scoped>

.card-frame {
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    gap: 0.3em;
    padding: 0.3em;
    background-color: #333333;
    border-radius: 1em;
    font: 1.1em always-together;
    width: min(16em, 90vw);
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


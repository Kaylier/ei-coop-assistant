<template>
    <div class="card-frame">
        <h3>
            <label v-if="description" tabindex="0" class="tooltip-icon">
                ⓘ
                <span class="tooltip-text" v-html="description" />
            </label>
            {{ title }}
        </h3>
        <inventory-frame :artifacts="set" :isSet="true" :userData="userData" :column="4" :row="1" />
        <div v-if="multiplierEB">
            <img v-if="activeMirror" src="/img/icons/mirror.png" alt="🔀"/>
            <span class="highlighted">
                ×{{ formatNumber(multiplierEB) }}
            </span>
            EB
            <template v-if="baseEB">
                (
                <span class="highlighted">
                    {{ formatNumber(baseEB*100) }}%
                </span>
                &rarr;
                <span class="highlighted">
                    {{ formatNumber(baseEB*multiplierEB*100) }}%
                </span>
                )
            </template>
        </div>
        <div v-if="multiplierOnline">
            <span class="highlighted">
                ×{{ formatNumber(multiplierOnline) }}
            </span>
            egg value
        </div>
        <div v-if="multiplierOffline">
            <span class="highlighted">
                ×{{ formatNumber(multiplierOffline) }}
            </span>
            away earnings
        </div>
        <div v-if="researchCostMultiplier && researchCostMultiplier !== 1">
            <img v-if="swappedCube" :src="getImageSource(swappedCube)" alt="🔀"/>
            <span class="highlighted">
                -{{ formatNumber((1 - researchCostMultiplier)*100) }}%
            </span>
            research cost
        </div>

        <slot/>
    </div>
</template>

<script setup lang="ts">
import * as T from '@/scripts/types.ts';
import { formatNumber } from '@/scripts/utils.ts';
import { getImageSource } from '@/scripts/artifacts.ts';

defineProps<{
    title: string,
    description?: string,
    set: T.Item[],
    userData: T.UserData,
    baseEB?: number,
    activeMirror?: boolean,
    multiplierEB?: number,
    multiplierOnline?: number,
    multiplierOffline?: number,
    swappedCube?: T.Artifact,
    researchCostMultiplier?: number,
}>();

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


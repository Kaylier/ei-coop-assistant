<template>
    <svg :width="size" :height="size" viewBox="0 0 200 200">
        <defs>
            <radialGradient id="centralGradientGreen">
                <stop offset="0%"   stop-color="#386" stop-opacity="1" />
                <stop offset="50%"  stop-color="#386" stop-opacity="1" />
                <stop offset="100%" stop-color="#386" stop-opacity="0" />
            </radialGradient>
            <radialGradient id="centralGradientOrange">
                <stop offset="0%"   stop-color="#a82" stop-opacity="1" />
                <stop offset="50%"  stop-color="#a82" stop-opacity="1" />
                <stop offset="100%" stop-color="#a82" stop-opacity="0" />
            </radialGradient>
            <radialGradient id="centralGradientRed">
                <stop offset="0%"   stop-color="#832" stop-opacity="1" />
                <stop offset="50%"  stop-color="#832" stop-opacity="1" />
                <stop offset="100%" stop-color="#832" stop-opacity="0" />
            </radialGradient>
        </defs>

        <g transform="translate(100, 100)">
        <!-- <circle r="95" stroke="#832" stroke-width="2" fill="none"/> -->

        <path v-for="(arc, i) in arcs"
              :d="arc.path"
              :fill="arc.color"
              />

        <circle r="80" :fill="`url(#${data.complete ? data.boosts.value < 0.2 ? 'centralGradientGreen' :
        'centralGradientOrange' : 'centralGradientRed'})`"/> <!-- Central status disc -->

        <template v-if="data.complete && data.boosts.value < 0.2">
            <text text-anchor="middle" dominant-baseline="middle" dy="-25">
                YES
            </text>
            <text text-anchor="middle" dominant-baseline="middle" dy="0"  >
                in {{ data.time.valueLabel ?? formatNumber(data.time.value) }}
            </text>
            <text text-anchor="middle" dominant-baseline="middle" dy="25" >
                at {{ data.population.valueLabel ?? formatNumber(data.population.value) }} chicken{{ data.population.value > 1 ? 's' : ''}}
            </text>
        </template>
        <template v-else-if="data.complete">
            <text text-anchor="middle" dominant-baseline="middle" dy="-25">
                YES
            </text>
            <text text-anchor="middle" dominant-baseline="middle" dy="0"  >
                with {{ data.boosts.valueLabel }} from boosts
            </text>
            <text text-anchor="middle" dominant-baseline="middle" dy="25" >
                in {{ data.time.valueLabel ?? formatNumber(data.time.value) }}
            </text>
            <text text-anchor="middle" dominant-baseline="middle" dy="50" >
                at {{ data.population.valueLabel ?? formatNumber(data.population.value) }} chicken{{ data.population.value > 1 ? 's' : ''}}
            </text>
        </template>
        <template v-else>
            <text text-anchor="middle" dominant-baseline="middle" dy="-25">
                NO
            </text>
            <text text-anchor="middle" dominant-baseline="middle" dy="0"  >
                missing a
            </text>
            <text text-anchor="middle" dominant-baseline="middle" dy="25" style="font-kerning:none;" >
                ×{{ formatNumber(Math.ceil(Math.exp(data.time.value+data.boosts.value)/10) ) }}
            </text>
            <text text-anchor="middle" dominant-baseline="middle" dy="50" >
                earning factor
            </text>
        </template>

        <template v-if="focused">
            <path :d="focused.extendedPath"
                  :fill="focused.color"/>
            <circle r="70" :fill="focused.color"/>
            <text text-anchor="middle" dominant-baseline="middle" dy="-10"  >
                {{ focused.label }}
            </text>
            <text text-anchor="middle" dominant-baseline="middle" dy="10" style="font-kerning:none;" >
                {{ focused.value }}
            </text>
        </template>

        <path v-for="(arc, i) in arcs"
              :d="arc.extendedPath"
              fill="#0000"
              @mouseenter="focused = arc"
              @mouseleave="focused = null"
              @touchstart="focused = arc"
              @touchend="focused = null"
              />

        </g>
    </svg>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { formatNumber } from '@/scripts/utils.ts';

type MultiplierData = {
    label: string,
    value: number,
    valueLabel?: string,
    color?: string,
};

type Arc = {
    label: string,
    value: string,
    path: string,
    extendedPath: string,
    color: string,
};

const props = defineProps<{
    size: string,
    data: {
        min: number,
        max: number,
        multipliers: MultiplierData[],
        population: MultiplierData,
        boosts: MultiplierData,
        time: MultiplierData,
        complete: boolean,
    }
}>();


const focused = ref<Arc|null>(null);

const arcs = computed(() => {
    const ret: Arc[] = [];

    const max = Math.max(props.data.max - props.data.min, 0);

    let start: number = 0;
    for (let x of [...props.data.multipliers, props.data.population, props.data.boosts, props.data.time]) {
        const end = Math.min(start + x.value/max, 1);
        if (start < end) {
            ret.push({
                label: x.label,
                value: x.valueLabel ?? '×'+formatNumber(x.value),
                path: generateSvgArc(start, end, 95, 98),
                extendedPath: generateSvgArc(start, end, 50, 100),
                color: x.color ?? "#555",
            });
        }
        start = end;
    }
    return ret;
});


/**
 * Generate an SVG path string for a progress segment
 */
function generateSvgArc(start: number, end: number, innerRadius: number, outerRadius: number): string {
    const largeArcFlag = end - start > 0.5 ? 1 : 0;

    // start and end coordinates on unit circle
    const startX = -Math.sin(2*Math.PI*start);
    const startY = -Math.cos(2*Math.PI*start);
    const endX   = -Math.sin(2*Math.PI*end);
    const endY   = -Math.cos(2*Math.PI*end);

    // The arc commands: A rx ry x-axis-rotation large-arc-flag sweep-flag x y
    return [
        `M ${outerRadius*startX} ${outerRadius*startY}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${outerRadius*endX} ${outerRadius*endY}`,
        `L ${innerRadius*endX} ${innerRadius*endY}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${innerRadius*startX} ${innerRadius*startY}`,
        'Z',
    ].join(' ')
}

</script>

<style scoped>
</style>


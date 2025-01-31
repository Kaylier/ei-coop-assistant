<template>
    <div id="item-tooltip" ref="tooltip"
         class="item-tooltip-container" :class="getRarityClass(item)"
         :style="{ top: position.top + 'px', left: position.left + 'px', visibility: visible ? 'visible' : 'hidden', opacity: visible ? 0.95 : 0 }">
        <span v-if="item" class="artifact-line">
            <img :src="getImageSource(item)" />
            <div class="description-container">
                <span>{{ getName(item) }}</span>
                <span v-for="descr in getDescriptions(item)">
                    <span class="bonus-value">{{ descr[0] }}</span>
                    {{ descr[1] }}
                </span>
            </div>
        </span>
        <span v-if="item" v-for="stone in item.stones" class="stone-line">
            <img :src="getImageSource(stone)" />
            <div class="description-container">
                <span>{{ getName(stone) }}</span>
                <span v-for="descr in getDescriptions(stone)">
                    <span class="bonus-value">{{ descr[0] }}</span>
                    {{ descr[1] }}
                </span>
            </div>
        </span>
    </div>
</template>

<script setup>
import * as T from '/scripts/types.ts';
import { ref, watch, nextTick } from 'vue';
import { getName, getDescriptions, getImageSource } from 'scripts/artifacts.ts';

const tooltip = ref(null);
const visible = ref(false);
const position = ref({ top: 0, left: 0 });
const item = ref(null);

function show(newItem, event) {
    item.value = newItem;
    visible.value = true;

    nextTick(() => {
        if (!tooltip) return;
        const rect = event.target.getBoundingClientRect();
        const tooltipWidth = tooltip.value.offsetWidth;
        const tooltipHeight = tooltip.value.offsetHeight;

        let left = rect.left + window.scrollX;
        let top = rect.top + window.scrollY;

        if (rect.left + tooltipWidth > window.innerWidth) {
            left = Math.max(0, window.innerWidth - tooltipWidth) + window.scrollX;
        }

        if (rect.top + tooltipHeight > window.innerHeight) {
            top = Math.max(0, window.innerHeight - tooltipHeight) + window.scrollY;
        }

        position.value = { top, left };
    });
};

function hide() {
    visible.value = false;
};

defineExpose({ show, hide });

function getRarityClass(item) {
    if (!item) return "";
    const ret = T.Rarity[item.rarity];
    return ret ? ret.toLowerCase() : "";
}

</script>

<style scoped>
.item-tooltip-container {
    position: absolute;
    z-index: 1000;
    background: var(--bg-alt-color);
    border-radius: 1em;
    padding: 0.5em 0.75em 0.75em 0.75em;
    box-shadow: .25em .5em 1em .03em #0004;
    pointer-events: none;
    transition: opacity 0.3s, visibility 0.3s;
    display: flex;
    flex-flow: column nowrap;
    gap: 0.25em;
}

.common    { box-shadow: .25em .5em 1em .03em color-mix(in srgb, var(--common-color   ) 25%, #0005); }
.rare      { box-shadow: .25em .5em 1em .03em color-mix(in srgb, var(--rare-color     ) 25%, #0005); }
.epic      { box-shadow: .25em .5em 1em .03em color-mix(in srgb, var(--epic-color     ) 25%, #0005); }
.legendary { box-shadow: .25em .5em 1em .03em color-mix(in srgb, var(--legendary-color) 25%, #0005); }

.common    .artifact-line img { background: radial-gradient(55% 55% at center, var(--common-color   ), transparent); }
.rare      .artifact-line img { background: radial-gradient(55% 55% at center, var(--rare-color     ), transparent); }
.epic      .artifact-line img { background: radial-gradient(55% 55% at center, var(--epic-color     ), transparent); }
.legendary .artifact-line img { background: radial-gradient(55% 55% at center, var(--legendary-color), transparent); }

.artifact-line, .stone-line {
    display: flex;
    flex-flow: row nowrap;
    gap: 0.25em;
    align-items: center;
}

.artifact-line img {
    height: 3em;
    width: 3em;
}

.stone-line img {
    height: 1.8em;
    width: 1.8em;
    margin-left: 1.5em;
}

.description-container {
    display: flex;
    flex-flow: column nowrap;
}

.description-container > :first-child {
    margin-left: 0;
    font-weight: bold;
}

.description-container > * {
    margin-left: 1em;
}

.artifact-line .description-container > :first-child { font-size: 12pt; }
.artifact-line .description-container > *            { font-size: 9pt; }
.stone-line    .description-container > :first-child { font-size: 10pt; }
.stone-line    .description-container > *            { font-size: 9pt; }

.bonus-value {
    color: color-mix(in srgb, var(--active-color) 75%, white);
}

</style>

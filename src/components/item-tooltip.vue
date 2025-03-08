<template>
    <div id="item-tooltip" ref="tooltip"
         class="item-tooltip-container" :class="getRarityClass(item)"
         :style="{ top: position.top + 'px', left: position.left + 'px', visibility: visible ? 'visible' : 'hidden', opacity: visible ? 0.95 : 0 }">
        <span v-if="(item?.quantity ?? 1) > 1" class="quantity">{{ item ? (item.quantity ?? 1) : 0 }}</span>
        <span v-if="item" class="artifact-line">
            <img :src="getImageSource(item)" />
            <div class="description-container">
                <span class="stamp" :class="getRarityClass(item)">{{ getStamp(item) }}</span>
                <span class="name">{{ getName(item) }}</span>
                <span class="description" v-for="descr in getDescriptions(item)">
                    <span class="bonus-value">{{ descr[0] }}</span>
                    {{ descr[1] }}
                </span>
            </div>
        </span>
        <span v-if="isArtifact(item) && item.reslotted" class="stone-line reslot-line">
            <img src="/img/icons/shuffle.png" alt="🔀"/>
            <span class="description-container">Stones have been reslotted</span>
        </span>
        <span v-for="stone in getStones(item)" class="stone-line">
            <img :src="getImageSource(stone)" />
            <div class="description-container">
                <span class="name">
                    {{ getName(stone) }}
                </span>
                <span class="description" v-for="descr in getDescriptions(stone)">
                    <span class="bonus-value">{{ descr[0] }}</span>
                    {{ descr[1] }}
                </span>
            </div>
        </span>
        <span v-if="emptySlotCount = getEmptySlotCount(item)" class="stone-line">
            <img src="/img/icons/stone-slot.png" />
            <div class="description-container">
                <span class="name">
                    {{ emptySlotCount }}
                    empty stone {{ emptySlotCount > 1 ? 'slots' : 'slot' }}
                </span>
            </div>
        </span>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import * as T from '@/scripts/types.ts';
import { getName, getDescriptions, getImageSource } from '@/scripts/artifacts.ts';

const tooltip = ref();
const visible = ref<boolean>(false);
const position = ref<{ top: number, left: number }>({ top: 0, left: 0 });
const item = ref<T.Item | null>(null);
const emptySlotCount = ref<number>(0);

function show(newItem: T.Item, event: Event) {
    item.value = newItem;
    visible.value = true;

    nextTick(() => {
        if (!tooltip) return;
        // @ts-ignore
        const rect = event.target?.getBoundingClientRect?.() ?? { left: 0, top: 0 };
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

function isArtifact(item: T.Item | null): item is T.Artifact {
    return item !== null && item.category === T.ItemCategory.ARTIFACT;
}

function getStones(item: T.Item | null): T.Stone[] {
    if (!item || item.category !== T.ItemCategory.ARTIFACT) return [];
    return (item as T.Artifact).stones.filter(s => s !== null);
}

function getEmptySlotCount(item: T.Item | null): number {
    if (!item || item.category !== T.ItemCategory.ARTIFACT) return 0;
    return (item as T.Artifact).stones.filter(s => s === null).length;
}

function getRarityClass(item: T.Item | null): string {
    if (!item || item.category !== T.ItemCategory.ARTIFACT) return "";
    const ret = T.Rarity[(item as T.Artifact).rarity];
    return ret ? ret.toLowerCase() : "";
}

function getStamp(item: T.Item): string {
    if (!item || item.category !== T.ItemCategory.ARTIFACT) return "";
    const m = {
        [T.Rarity.COMMON]: "Common",
        [T.Rarity.RARE]: "Rare",
        [T.Rarity.EPIC]: "Epic",
        [T.Rarity.LEGENDARY]: "Legendary",
    };
    return `T${item.tier} ${m[item.rarity] ?? ''}`
}

</script>

<style scoped>
.item-tooltip-container {
    position: absolute;
    z-index: 1000;
    background: var(--bg-alt-color);
    border-radius: 1em;
    padding: 0.5em 1em 1em 0.75em;
    box-shadow: .25em .5em 1em .03em #0004;
    pointer-events: none;
    transition: opacity 0.3s, visibility 0.3s;
    display: flex;
    flex-flow: column nowrap;
    gap: 0.75em;
}

.item-tooltip-container.common {
    box-shadow: .25em .5em 1em .03em color-mix(in srgb, var(--common-color   ) 25%, #0005);
}
.item-tooltip-container.rare {
    box-shadow: .25em .5em 1em .03em color-mix(in srgb, var(--rare-color     ) 25%, #0005);
}
.item-tooltip-container.epic {
    box-shadow: .25em .5em 1em .03em color-mix(in srgb, var(--epic-color     ) 25%, #0005);
}
.item-tooltip-container.legendary {
    box-shadow: .25em .5em 1em .03em color-mix(in srgb, var(--legendary-color) 25%, #0005);
}

.item-tooltip-container.common    .artifact-line img {
    background: radial-gradient(55% 55% at center, var(--common-color   ), transparent);
}
.item-tooltip-container.rare      .artifact-line img {
    background: radial-gradient(55% 55% at center, var(--rare-color     ), transparent);
}
.item-tooltip-container.epic      .artifact-line img {
    background: radial-gradient(55% 55% at center, var(--epic-color     ), transparent);
}
.item-tooltip-container.legendary .artifact-line img {
    background: radial-gradient(55% 55% at center, var(--legendary-color), transparent);
}

.quantity {
    position: absolute;
    top: 0;
    right: 0;
    margin: 0.5em;
    font: 0.9em always-together;
}

.artifact-line, .stone-line {
    display: flex;
    flex-flow: row nowrap;
    gap: 0.5em;
    align-items: center;
}

.artifact-line {
    height: 2.9em;
}

.stone-line {
    height: 2.0em;
}

.artifact-line img {
    height: 100%;
}

.stone-line img {
    height: 100%;
    margin-left: 1.5em;
}

.description-container {
    display: flex;
    flex-flow: column nowrap;
}

.description-container .stamp {
    font-weight: normal;
    margin-left: 0;
}

.description-container .stamp.common    { color: color-mix(in srgb, var(--common-color   ) 50%, white); }
.description-container .stamp.rare      { color: color-mix(in srgb, var(--rare-color     ) 75%, white); }
.description-container .stamp.epic      { color: var(--epic-color     ); }
.description-container .stamp.legendary { color: var(--legendary-color); }

.description-container .name {
    margin-left: 0;
    font-weight: bold;
}

.description-container .stamp {
    margin-left: 0.5em;
}

.description-container .description {
    margin-left: 1.2em;
}

.stamp               { font-size: 0.75em; }
.artifact-line .name { font-size: 1em; }
.stone-line    .name { font-size: 0.85em; }
.description         { font-size: 0.75em; }

.bonus-value {
    color: color-mix(in srgb, var(--active-color) 75%, white);
}

.reslot-line {
    height: 1em;
    margin-left: 0.5em;
}

.reslot-line img {
    height: 100%;
    width: auto;
}

.reslot-line span {
    font-size: 0.75em;
    font-style: italic;
    color: var(--warning-text-color);
}

</style>

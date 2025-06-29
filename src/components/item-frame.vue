<template>
    <div class="item-frame" :class="[getRarityClass(item), item.id && highlightedItemId === item.id ? 'highlighted' : '']"
       @mouseenter="showItemTooltip(item, $event)"
       @mouseleave="hideItemTooltip()"
       @touchstart="showItemTooltip(item, $event)"
       @touchend="hideItemTooltip()"
       @focus="onFocusEnter(item, $event)"
       @blur="onFocusLeave()"
       >

        <img class="item-image"
             :src="getImageSource(item)"
             :alt="getName(item)"
             />

        <div v-if="(item.quantity ?? 1) > 1 && !(item.category === T.ItemCategory.ARTIFACT && item.reslotted)"
             class="item-quantity">
            {{ item.quantity?.toLocaleString() }}
        </div>

        <div class="stones-frame">
            <img v-for="stone in itemStones(item)"
                 class="stone-frame"
                 :src="getImageSource(stone)"
                 :alt="getName(stone)"
                 />
            <img v-if="item.category === T.ItemCategory.ARTIFACT && item.reslotted"
                 class="stone-frame"
                 src="/img/icons/shuffle.png"
                 alt="🔀"
                 />
        </div>

    </div>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue';
import type { Ref } from 'vue';
import * as T from '@/scripts/types.ts';
import { getImageSource, getName } from '@/scripts/artifacts.ts';

const showItemTooltip = inject("showItemTooltip") as (item: T.Item, event: Event) => void;
const hideItemTooltip = inject("hideItemTooltip") as () => void;
const highlightedItemId = inject<Ref<number | null>>("highlightedItemId", ref(null));

defineProps<{
    item: T.Item
}>();

function itemStones(item: T.Item): T.Stone[] {
    if (item.category !== T.ItemCategory.ARTIFACT) return [];
    return (item as T.Artifact).stones.filter(s => s !== null);
}

function getRarityClass(item: T.Item): string {
    if (item.category !== T.ItemCategory.ARTIFACT) return "";
    const ret = T.Rarity[(item as T.Artifact).rarity];
    return ret ? ret.toLowerCase() : "";
}

function onFocusEnter(item: T.Item, event: Event) {
    showItemTooltip(item, event);
    highlightedItemId.value = item.id ?? null;
}

function onFocusLeave() {
    hideItemTooltip();
    highlightedItemId.value = null;
}

</script>

<style scoped>

.item-frame {
    position: relative;
    aspect-ratio: 1;
    margin: auto;
    min-height: 2.5rem;
    min-width: 2.5rem;
    height: 100%;
    width: 100%;
    border-radius: 1em;
    display: flex;
    align-items: center;
    justify-content: center;
}

.highlighted.item-frame.common    { background: var(--common-color   ); }
.highlighted.item-frame.rare      { background: var(--rare-color     ); }
.highlighted.item-frame.epic      { background: var(--epic-color     ); }
.highlighted.item-frame.legendary { background: var(--legendary-color); }

.item-quantity {
    position: absolute;
    top: 0;
    right: 0;
    font: 0.75em always-together;
    font-weight: bold;
    line-height: 1.6em;
    fill: #e0e0e0;
}

.item-image, .sparkle-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    aspect-ratio: 1/1;
}

.stones-frame {
    position: absolute;
    bottom: 0%;
    right: 0%;
    height: 25%;
    width: 100%;
    display: flex;
    flex-flow: row-reverse nowrap;
    justify-content: flex-start;
    align-items: stretch;
}

.stone-frame {
    height: 100%;
    width: auto;
    aspect-ratio: 1;
    margin: 0 0 0 -5%;
}

</style>



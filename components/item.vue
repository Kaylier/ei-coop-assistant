<template>
    <div class="item-frame" :class="[getRarityClass(item), item?.id && highlightedItemId === item.id ? 'highlighted' : '']"
       @mouseenter="showItemTooltip(item, $event)"
       @mouseleave="hideItemTooltip()"
       @touchstart="showItemTooltip(item, $event)"
       @touchend="hideItemTooltip()"
       @focus="onFocusEnter(item, $event)"
       @blur="onFocusLeave()">

        <img class="item-image"
            :src="getImageSource(item)"
            :alt="getName(item)"></img>

        <svg v-if="item.quantity > 1 && !item.reslotted"
            class="item-quantity"
            viewBox="0 0 100 20"
            preserveAspectRatio="xMaxYMin meet"
            ><text x="100%" y="100%" text-anchor="end"> {{ item.quantity.toLocaleString() }} </text></svg>

        <div class="stones-frame">
            <img v-for="stone in item.stones.filter(s => s !== null)"
                class="stone-frame"
                :src="getImageSource(stone)"
                :alt="getName(stone)"></img>
            <img v-if="item.reslotted"
                class="stone-frame"
                src="/img/icons/shuffle.png"
                alt="🔀"></img>
        </div>

    </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import * as T from '/scripts/types.ts';
import { getImageSource, getName } from '/scripts/artifacts.ts';

const showItemTooltip = inject("showItemTooltip");
const hideItemTooltip = inject("hideItemTooltip");
const highlightedItemId = inject("highlightedItemId");

const props = defineProps<{
    item: T.Item
}>();

function getRarityClass(item: T.Item): string {
    const ret = T.Rarity[item.rarity];
    return ret ? ret.toLowerCase() : "";
}

function onFocusEnter(item, event) {
    showItemTooltip(item, event);
    highlightedItemId.value = item.id;
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
    height: min(4em, 12vw);
    width: min(4em, 12vw);
    border-radius: 1em;
}

.highlighted.item-frame.common    { background: var(--common-color   ); }
.highlighted.item-frame.rare      { background: var(--rare-color     ); }
.highlighted.item-frame.epic      { background: var(--epic-color     ); }
.highlighted.item-frame.legendary { background: var(--legendary-color); }

.item-frame.common    { background: radial-gradient(55% 55% at center, var(--common-color   ), transparent); }
.item-frame.rare      { background: radial-gradient(55% 55% at center, var(--rare-color     ), transparent); }
.item-frame.epic      { background: radial-gradient(55% 55% at center, var(--epic-color     ), transparent); }
.item-frame.legendary { background: radial-gradient(55% 55% at center, var(--legendary-color), transparent); }

.item-quantity {
    position: absolute;
    top: 0;
    right: 0;
    height: 15%;
    width: 100%;
    font: 18pt always-together;
    fill: #e0e0e0;
}

.item-image, .sparkle-image {
    max-width: 100%;
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



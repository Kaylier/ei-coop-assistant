<!-- TODO: handle large size image when zoomed in -->
<template>
    <div class="item-frame" :class="getRarityClass(item)">

        <img class="item-image"
            :src="getImgSrc(item)"
            :alt="getName(item)"></img>

        <svg v-if="item.quantity > 1"
            class="item-quantity"
            viewBox="0 0 100 20"
            preserveAspectRatio="xMaxYMin meet"
            ><text x="100%" y="100%" text-anchor="end"> {{ item.quantity.toLocaleString() }} </text></svg>

        <div class="stones-frame">
            <img v-for="stone in item.stones"
                class="stone-frame"
                :src="getImgSrc(stone)"
                :alt="getName(stone)"></img>
        </div>

    </div>
</template>

<script setup lang="ts">
import * as T from '/scripts/types.ts';
import { getImgSrc, getName } from '/scripts/artifacts.ts';

const props = defineProps<{
    item: T.Item
}>();

function getRarityClass(item: T.Item): string {
    const ret = T.Rarity[item.rarity];
    return ret ? ret.toLowerCase() : "";
}
</script>

<style scoped>

.item-frame {
    position: relative;
    aspect-ratio: 1;
    margin: auto;
}

.item-frame.common {
    /* background: sadness; */
    background: radial-gradient(55% 55% at center, #555, #5550);
}

.item-frame.rare {
    background: radial-gradient(55% 55% at center, #37b, #37b0);
}

.item-frame.epic {
    background: radial-gradient(55% 55% at center, #b37, #b370);
}

.item-frame.legendary {
    background: radial-gradient(55% 55% at center, #b90, #b900);
}

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
    position: absolute;
    width: 100%;
    height: 100%;
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



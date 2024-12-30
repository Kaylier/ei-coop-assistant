<template>
    <div class="main-frame">
        <div v-for="set in sets" class="set-frame">
            <div v-for="item in set" class="item-frame" :class="getRarityClass(item)">
                <img v-if="item" class="item-image"
                    :src="getImgSrc(item)"
                    :alt="getName(item)"></img>

                <svg v-if="item && item.quantity > 1"
                    class="item-quantity"
                    viewBox="0 0 100 20"
                    preserveAspectRatio="xMaxYMin meet"
                    ><text x="100%" y="100%" text-anchor="end"> {{ item.quantity.toLocaleString() }} </text></svg>

                <div v-if="item && item.stones" class="stones-frame">
                    <img v-for="stone in item.stones"
                        class="stone-frame"
                        :src="getImgSrc(stone)"
                        :alt="getName(stone)"></img>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import * as T from '/scripts/types.ts';
import { getImgSrc, getName } from '/scripts/artifacts.ts';

const props = defineProps<{
    sets: Item[][],
}>();

function getRarityClass(item: T.Item): string {
    const ret = item ? T.Rarity[item.rarity] : null;
    return ret ? ret.toLowerCase() : "";
}
</script>

<style scoped>
.main-frame {
    width: 100%;
    height: auto;
    display: flex;
    flex-flow: column nowrap;
    gap: calc(3px + 0.3vw);
    padding: calc(3px + 0.3vw);
    overflow: scroll;
    background: #333333;
    border-radius: 1em;
}

.set-frame {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-flow: row nowrap;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: calc(1px + 0.3vw);
    padding: calc(1px + 0.3vw);
    background: #404040;
    border-radius: 1em;
}

.item-frame {
    position: relative;
    aspect-ratio: 1;
    background: #333333;
    border-radius: 1em;
    height: 100%;
}

.item-frame.highlight {
    border: solid var(--valid-hover-color);
}

.item-frame.common {
    background: radial-gradient(60% 60% at center, #555, #333);
}

.item-frame.rare {
    background: radial-gradient(60% 60% at center, #37b, #333);
}

.item-frame.epic {
    background: radial-gradient(60% 60% at center, #b37, #333);
}

.item-frame.legendary {
    background: radial-gradient(60% 60% at center, #b90, #333);
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

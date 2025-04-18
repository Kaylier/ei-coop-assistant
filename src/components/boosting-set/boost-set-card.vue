<template>
    <div id="card-frame">
        <div id="header-frame">
            <div id="cost-info">
                <div>
                    <span> {{ formatNumber(tokenCost) }} </span>
                    <img src="/img/icons/token.png" alt="tok"/>
                </div>
                <div>
                    <span> {{ formatNumber(geCost) }} </span>
                    <img src="/img/icons/golden-egg.png" alt="GE"/>
                </div>
            </div>
            <div id="boost-info">
                <div v-for="boost in props.boosts" class="boost">
                    <img v-for="idx in boost.amount ?? 1" :src="`/img/boosts/${boost.id}.png`" :alt="boost.id[0].toUpperCase()"/>
                    {{ boostMetadata[boost.id].text ?? 'unknown boost' }}
                </div>
            </div>
        </div>
        <div id="bar-frame">
            <div id="bar">
                <div v-for="{ style, tooltip} in barData" tabindex="0" class="bar-fill tooltip-icon" :style="style">
                    <span class="tooltip-text" v-html="tooltip"/>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import * as T from '@/scripts/types.ts';
import { computed } from 'vue';
import { formatNumber, formatTime } from '@/scripts/utils.ts';


const props = defineProps<{
    boosts: { id: T.Boost, amount?: number }[],
    ihr: number,
    dili: number,
    maxPopulation: number,
}>();

enum BoostType {
    TACHYON,
    BOOST,
};

const boostMetadata = {
    [T.Boost.TACHYON_10X30  ]: {
        type: BoostType.TACHYON, value:   10, duration:  30, tokens: 1, ge:   200, text: "10× for 30min" },
    [T.Boost.TACHYON_10X10  ]: {
        type: BoostType.TACHYON, value:   10, duration:  10, tokens: 0, ge:    50, text: "10× for 10min" },
    [T.Boost.TACHYON_10X240 ]: {
        type: BoostType.TACHYON, value:   10, duration: 240, tokens: 0, ge:   500, text: "10× for 4hr" },
    [T.Boost.TACHYON_100X20 ]: {
        type: BoostType.TACHYON, value:  100, duration:  20, tokens: 3, ge:  1000, text: "100× for 20min" },
    [T.Boost.TACHYON_100X10 ]: {
        type: BoostType.TACHYON, value:  100, duration:  10, tokens: 2, ge:  1000, text: "100× for 10min" },
    [T.Boost.TACHYON_100X120]: {
        type: BoostType.TACHYON, value:  100, duration: 120, tokens: 2, ge:  5000, text: "100× for 2hr" },
    [T.Boost.TACHYON_1000X10]: {
        type: BoostType.TACHYON, value: 1000, duration:  10, tokens: 4, ge: 12000, text: "1000× for 10min" },
    [T.Boost.TACHYON_1000X60]: {
        type: BoostType.TACHYON, value: 1000, duration:  60, tokens: 4, ge: 25000, text: "1000× for 1hr" },
    [T.Boost.BOOST_2X30     ]: {
        type: BoostType.BOOST  , value:    2, duration:  30, tokens: 1, ge:  1000, text: "2× for 30min" },
    [T.Boost.BOOST_10X10    ]: {
        type: BoostType.BOOST  , value:   10, duration:  10, tokens: 4, ge:  8000, text: "10× for 10min" },
    [T.Boost.BOOST_5X60     ]: {
        type: BoostType.BOOST  , value:    5, duration:  60, tokens: 3, ge: 15000, text: "5× for 1hr" },
    [T.Boost.BOOST_50X10    ]: {
        type: BoostType.BOOST  , value:   50, duration:  10, tokens: 8, ge: 50000, text: "50× for 10min" },
};

const tokenCost = computed(() => props.boosts.reduce((tot, cur) => tot + boostMetadata[cur.id].tokens*(cur.amount ?? 1), 0));
const geCost = computed(() => props.boosts.reduce((tot, cur) => tot + boostMetadata[cur.id].ge*(cur.amount ?? 1), 0));

const milestones = computed(() => {
    // Find the times when the boost state changes
    const times: number[] = [];
    for (const boost of props.boosts) {
        const duration = boostMetadata[boost.id].duration;
        times.includes(duration) || times.push(duration);
    }
    times.sort((a,b) => a-b);

    const ret = [];

    // At each time threshold, calculate the increased population
    let population = 0, prevTime = 0;
    for (const time of times) {
        let totalTachyon = 0;
        let totalBoost = 0;
        for (const boost of props.boosts) {
            const boostData = boostMetadata[boost.id];
            if (boostData.duration < time) continue;

            if (boostData.type === BoostType.TACHYON) {
                totalTachyon += boostData.value*(boost.amount ?? 1);
            } else if (boostData.type === BoostType.BOOST) {
                totalBoost += boostData.value*(boost.amount ?? 1);
            }
        }
        const rate = (totalTachyon || 1)*(totalBoost || 1)*props.ihr*props.dili;
        const increase = rate*(time - prevTime);

        if (population < props.maxPopulation && population + increase >= props.maxPopulation) {
            // Insert a milestone for maxed habs
            const filledTime = (props.maxPopulation - population)/rate;
            ret.push({ population: props.maxPopulation, time: (prevTime + filledTime)*props.dili });
        }

        population += increase;
        prevTime = time;
        ret.push({ population, time: time*props.dili });
    }

    return ret;
});

const barData = computed(() => {
    const ret = [];

    let opacity = 1;
    for (const { population, time } of milestones.value) {
        if (population < props.maxPopulation) {
            ret.push({
                style: {width: `${100*population/props.maxPopulation}%`, opacity },
                tooltip: `${formatNumber(population)} chickens after ${formatTime(time, 'm')}`,
                });
            //opacity *= 0.6;
        } else {
            ret.push({
                style: { width: `100%`, opacity },
                tooltip: `Filled after ${formatTime(time, 'm')}`,
                });
            break;
        }
    }

    return ret.reverse();
});

</script>

<style scoped>

#card-frame {
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    border-radius: 1em;
    font: 1.1em always-together;
}

#header-frame {
    display: flex;
    flex-flow: row nowrap;
    gap: .5em;
    padding: 0.5em 1em 0 1em;
    background-color: #333333;
    border-radius: 2em 2em 0 0;
}

#cost-info {
    display: flex;
    flex-flow: column;
    align-items: flex-end;
}

#cost-info div span {
    padding: 0 0.2em;
}

#boost-info {
    display: flex;
    flex-flow: column;
    align-items: flex-start;
}

#bar-frame {
    position: relative;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    border: 1px var(--bg-alt-color) solid;
    border-radius: 0.45em;
}

#timer {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    aspect-ratio: 1;
    border-radius: 0.45em;
    background: var(--bg-alt-color);
}

#bar {
    position: relative;
    width: 16em;
    height: .5em;
    margin: 0.2em;
    border-radius: .25em;
    background: #b434;
}

.bar-fill {
    position: absolute;
    background: linear-gradient(to right, #3848, #384);
    height: 100%;
    border-radius: .5em;
    box-shadow: .2em 0 .4em #0008;
}

img {
    height: 0.75em;
    transform: scale(1.5);
}

.tooltip-text {
    transform: translate(-50%, 50%);
    opacity: 1;
}

</style>


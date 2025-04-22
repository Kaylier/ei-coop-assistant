<template>
    <div id="card-frame">
        <div id="header-frame">
            <button v-if="pinned !== undefined" id="pin"
                    title="Mark as favourite"
                    @click="(e: Event) => emit('changed', !pinned)">
                {{ pinned ? '★' : '☆' }}
            </button>
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
                    <img v-for="idx in (boost.amount ?? 1)*(boost.streamlined ?? 1)" :src="`/img/boosts/${boost.id}.png`" :alt="boost.id[0].toUpperCase()"/>
                    {{ boostMetadata[boost.id].text ?? 'unknown boost' }}
                </div>
            </div>
        </div>
        <div id="bar-frame">
            <div id="bar">
                <div v-for="{ style, speed, tag} in barData" class="bar-fill" :class="speed" :style="style">
                    <span class="time-tag" v-html="tag"/>
                </div>
            </div>
        </div>
        <div id="details-frame">
            <span v-for="{ population, time } in milestones">
                <span class="highlighted">{{ formatNumber(population) }}</span>
                chickens after
                <span class="highlighted">{{ formatTime(time, 'm') }}</span>
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import * as T from '@/scripts/types.ts';
import { computed } from 'vue';
import { formatNumber, formatTime } from '@/scripts/utils.ts';


const props = defineProps<{
    boosts: { id: T.Boost, amount?: number, streamlined?: number }[],
    ihr: number,
    dili: number,
    maxPopulation: number,
    pinned?: boolean, // not shown if undefined
}>();

const emit = defineEmits<{
    (e: 'changed', value: boolean): void
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

const tokenCost = computed(() => {
    let tot = 0;
    for (const b of props.boosts) {
        tot += boostMetadata[b.id].tokens*(b.amount ?? 1)*(b.streamlined ?? 1);
    }
    return tot;
});

const geCost = computed(() => {
    let tot = 0;
    for (const b of props.boosts) {
        tot += boostMetadata[b.id].ge*(b.amount ?? 1)*(b.streamlined ?? 1);
    }
    return tot;
});

const milestones = computed(() => {
    // Find the times when the boost state changes
    const times: number[] = [];
    for (const boost of props.boosts) {
        const duration = boostMetadata[boost.id].duration;
        for (let i = 1; i <= (boost.streamlined ?? 1); i++) {
            times.includes(duration*i) || times.push(duration*i);
        }
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
            if (boostData.duration*(boost.streamlined ?? 1) < time) continue;

            if (boostData.type === BoostType.TACHYON) {
                totalTachyon += boostData.value*(boost.amount ?? 1);
            } else if (boostData.type === BoostType.BOOST) {
                totalBoost += boostData.value*(boost.amount ?? 1);
            }
        }
        if (!totalTachyon) continue

        const rate = (totalTachyon || 1)*(totalBoost || 1)*props.ihr;
        const increase = rate*(time - prevTime)*props.dili;

        if (population < props.maxPopulation && population + increase >= props.maxPopulation) {
            // Insert a milestone for maxed habs
            const filledTime = prevTime + (props.maxPopulation - population)/rate/props.dili;
            ret.push({ population: props.maxPopulation, time: filledTime*props.dili, rate });
        }

        population += increase;
        prevTime = time;
        ret.push({ population, time: time*props.dili, rate });
    }

    return ret;
});

const barData = computed(() => {
    const ret = [];

    const highRate = milestones.value.reduce((tot,cur) => Math.max(tot, cur.rate), 0);

    for (const { population, time, rate } of milestones.value) {
        const speed = rate >= highRate*0.6 ? 'fast' : 'slow';
        if (population < props.maxPopulation) {
            ret.push({
                style: { width: `${100*population/props.maxPopulation}%` },
                speed: speed,
                tag: formatTime(time, 'm'),
                });
        } else {
            ret.push({
                style: { width: `100%` },
                speed: speed,
                tag: formatTime(time, 'm'),
                });
            break;
        }
    }

    return ret.reverse();
});

</script>

<style scoped>

#card-frame {
    position: relative;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    border-radius: 1em;
    font: 1.1em always-together;
}

#header-frame:hover ~ #details-frame,
#header-frame:active ~ #details-frame,
#header-frame:focus ~ #details-frame {
    display: flex;
}

#header-frame {
    position: relative;
    display: flex;
    flex-flow: row nowrap;
    gap: .5em;
    padding: 0.5em 1em 0 1em;
    background-color: #333333;
    border-radius: 2em 2em 0 0;
    box-shadow: 0 0 .5em var(--bg-hover-color) inset;
}

#details-frame {
    position: absolute;
    top: 100%;
    display: none;
    flex-flow: column nowrap;
    padding: 0.5em 1em 0.2em 1em;
    background-color: #333333;
    border-radius: 0 0 1em 1em;
    z-index: 1;
    box-shadow: 0 0 .5em var(--bg-hover-color) inset;
}

#pin {
    position: absolute;
    top: 0;
    left: 0;
    width: 1em;
    height: 1em;
    scale: 1.8;
    padding: 0;
    background: none;
    cursor: pointer;
}

#pin:hover,
#pin:focus:hover {
    outline: none;
    color: var(--valid-hover-color);
}

#pin:focus {
    outline: none;
    color: var(--valid-color);
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
    background: linear-gradient(to right, #444, #888);
    height: 100%;
    border-radius: .5em;
    box-shadow: .2em 0 .4em #0008;
}

.bar-fill.fast {
    background: linear-gradient(to right, #3b6644, #384);
}

.bar-fill.slow {
    background: linear-gradient(to right, #3b665d, #387);
}

img {
    height: 0.75em;
    transform: scale(1.5);
}

.time-tag {
    position: absolute;
    padding: .25em .5em 0 .5em;
    right: 0;
    top: calc(100% + .2em);
    border-radius: .5em 0 .5em .5em;
    box-shadow: .0em 0 .4em #0008;
    background: var(--bg-alt-color);
    opacity: 0.9;
    text-wrap: nowrap;
}

.time-tag:hover,
.time-tag:active,
.time-tag:focus {
    z-index: 1;
}

.highlighted {
    color: color-mix(in srgb, var(--active-color) 75%, white);
    font-kerning: none;
}
</style>


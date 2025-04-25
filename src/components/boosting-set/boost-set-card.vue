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
                    <img v-for="_ in (boost.amount ?? 1)*(boost.streamlined ?? 1)" :src="`/img/boosts/${boost.id}.png`" :alt="boost.id[0].toUpperCase()"/>
                    {{ boostMetadata[boost.id].text ?? 'unknown boost' }}
                </div>
            </div>
        </div>
        <div id="bar-frame">
            <div id="bar">
                <div v-for="{ style, speed, tag} in barData" class="bar-fill" :class="speed" :style="style">
                    <span v-if="tag" class="time-tag" v-html="tag"/>
                </div>
            </div>
            <button v-if="timerData.length" class="timer-button" @click="timerToggle">
                {{ timer.isRunning.value ? `${formatTime(timer.elapsed.value)}` : 'start' }}
            </button>
        </div>
        <div id="details-frame">
            <span v-for="{ population, time, type } in milestones">
                <span v-if="type === 'filled'">Habs filled</span>
                <span v-if="type === 'artiswap'">Swap artifacts</span>
                <span v-if="type === 'boostswap'">Swap boosts</span>
                <span v-if="type === 'boostend'">Boosts end</span>
                after
                <span class="highlighted">{{ formatTime(time, 'm') }}</span>
                at
                <span class="highlighted">{{ formatNumber(population) }}</span>
                chickens
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import * as T from '@/scripts/types.ts';
import { ref, computed, onUnmounted } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { formatNumber, formatTime } from '@/scripts/utils.ts';
import type { Ref } from 'vue';


const props = defineProps<{
    boosts: { id: T.Boost, amount?: number, streamlined?: number }[],
    stats: { ihr: number, habCapacity: number }[],
    dili: number,
    startPopulation?: number,
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

const maxCapacity = computed(() => props.stats.at(-1)?.habCapacity ?? 11340000000);

const milestones = computed(() => {
    // Find the times when the boost state changes
    const times: number[] = [];
    const startTimes: number[] = [];
    for (const boost of props.boosts) {
        const duration = boostMetadata[boost.id].duration;
        for (let i = 1; i <= (boost.streamlined ?? 1); i++) {
            if (!times.includes(duration*i)) times.push(duration*i);
        }
        for (let i = 1; i < (boost.streamlined ?? 1); i++) {
            if (!startTimes.includes(duration*i)) startTimes.push(duration*i);
        }
    }
    times.sort((a,b) => a-b);

    const ret = [];

    let nextStatIdx = 1;
    let ihr = props.stats[0].ihr;
    let habCapacity = props.stats[0].habCapacity;

    // At each time threshold, calculate the increased population
    let population = (props.startPopulation ?? 0), prevTime = 0;

    for (const time of times) {
        // step between prevTime and time
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
        // no more tachyons? we're done.
        if (!totalTachyon) break;
        const boostBonus = (totalTachyon || 1)*(totalBoost || 1);
        const speed = totalBoost ? 'fast' : 'slow';

        let filledTime = prevTime + (habCapacity - population)/(boostBonus*ihr*props.dili);
        while (population < habCapacity && filledTime < time) {
            // Milestone: Hab capacity reached + potential artifact swap
            population += boostBonus*ihr*(filledTime - prevTime)*props.dili;
            prevTime = filledTime;
            const type = nextStatIdx == props.stats.length ? 'filled' : 'artiswap';
            ret.push({ population: habCapacity, time: filledTime*props.dili, speed, type });

            if (nextStatIdx >= props.stats.length) break;
            ihr = props.stats[nextStatIdx].ihr;
            habCapacity = props.stats[nextStatIdx].habCapacity;
            filledTime = prevTime + (habCapacity - population)/(boostBonus*ihr*props.dili);
            nextStatIdx++;
        }

        // Milestone: boost state change
        population += boostBonus*ihr*(time - prevTime)*props.dili;
        prevTime = time;
        const type = startTimes.includes(time) ? 'boostswap' : 'boostend';
        ret.push({ population, time: time*props.dili, speed, type });
    }

    return ret;
});

const barData = computed(() => {
    const ret = [];

    const startPopulation = props.startPopulation ?? 0;
    if ((startPopulation ?? 0) > 0) {
        // Start at non-empty habs
        ret.push({
            style: { width: `${100*startPopulation/maxCapacity.value}%` },
            //speed: speed,
            //tag: formatTime(time, 'm'),
        });
    }

    for (const { population, time, speed } of milestones.value) {
        if (population < maxCapacity.value) {
            ret.push({
                style: { width: `${100*population/maxCapacity.value}%` },
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

const timerData = computed(() => {
    const ret = [];

    for (const { time, type } of milestones.value) {
        let title, msg;
        switch (type) {
            case 'filled':
                title = "⏱️ eica - Habs filled";
                break;
            case 'artiswap':
                // remove 5s to give some margin
                title = "⏱️ eica - Time to swap artifacts";
                break;
            case 'boostswap':
                title = "⏱️ eica - Time to restart boosts";
                break;
        }
        if (title) {
            ret.push({ time: time*60, title, msg });
        }
    }

    return ret.sort((a,b) => a.time - b.time);
});

const canNotify = 'Notification' in window;

const timer: {
    elapsed: Ref<number>,
    isRunning: Ref<boolean>,
    intervalId: number|null,
    startTimestamp: number,
    notifications: { time: number, title?: string, msg?: string }[],
} = { elapsed: ref(0), isRunning: ref(false), intervalId: null, startTimestamp: 0, notifications: [] };

onUnmounted(() => {
    if (timer.intervalId != null) {
        clearInterval(timer.intervalId);
    }
});

onBeforeRouteLeave((to, from , next) => {
    if (timer.isRunning.value) {
        // If a timer is running, ask confirmation
        if (!window.confirm("Do you really want to leave? A timer is running!")) {
            next(false);
            return false;
        }
    }
    next();
});

function timerToggle() {
    if (timer.isRunning.value) {
        // stop timer
        console.log("Stop timer");
        timer.isRunning.value = false;
        if (timer.intervalId != null) {
            clearInterval(timer.intervalId);
            timer.intervalId = null;
        }
    } else {
        // start timer
        if (canNotify && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        timer.notifications = timerData.value;
        if (timer.notifications.length === 0) return;

        console.log("Start timer", timer.notifications);
        timer.isRunning.value = true;
        timer.elapsed.value = 0;
        timer.startTimestamp = Date.now();
        timer.intervalId = window.setInterval(timerUpdate, 1000);
    }
}

function timerUpdate() {
    timer.elapsed.value = (Date.now() - timer.startTimestamp)/1000;
    if (timer.elapsed.value >= timer.notifications[0]?.time) {
        if (canNotify && Notification.permission === 'granted') {
            const { title, msg } = timer.notifications[0];
            new Notification(title || "⏱️ eica", { body: msg, });
        }
        timer.notifications = timer.notifications.slice(1);
        if (timer.notifications.length === 0 && timer.isRunning.value) {
            timerToggle();
        }
    }
}

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
#header-frame:focus ~ #details-frame,
#bar-frame:hover ~ #details-frame,
#bar-frame:active ~ #details-frame,
#bar-frame:focus ~ #details-frame,
#bar-frame:focus-within ~ #details-frame {
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
    border-radius: 0.5em;
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

.timer-button {
    position: absolute;
    top: 50%;
    left: 0.45em;
    padding: 0.2em 0.4em 0 .4em;
    height: 1.2em;
    min-width: 1.2em;
    transform: translate(-50%, -50%);
    border-radius: 1em;
    font: inherit;
    transition: all .15s;
}

.timer-button:hover {
    min-width: 1.5em;
}

</style>


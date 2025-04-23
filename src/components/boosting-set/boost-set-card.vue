<template>
    <div id="card-frame" tabindex="0"
         @focusin="collapsed = false"
         @focusout="collapsed = true">
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
        <div v-if="!collapsed" class="tag-container tag-container-population">
            <span v-for="(segment, i) in segments"
                  class="time-tag"
                  :class="{ focused: focusedSegment === i }"
                  :style="{ right: `${100-segment.population1*100}%` }"
                  v-html="formatNumber(segment.population)"
                  />
        </div>
        <div id="details-frame" :class="{ collapsed: collapsed }">
            <svg width="100%" :viewBox="`0 0 100 ${DETAIL_GRAPH_RATIO*100}`">
                <g>
                <template v-for="(segment, i) in segments">
                <g class="details-graph-segment"
                   :class="{ hidden: collapsed }"
                   @mouseenter="focusedSegment = i"
                   @touchstart="focusedSegment = i"
                   @mouseleave="focusedSegment = undefined"
                   @touchend="focusedSegment = undefined"
                   >
                    <polygon :class="segment.speed"
                             :points="`${segment.time1*100-1},${DETAIL_GRAPH_RATIO*100-2}
                                       ${segment.population1*100-1},2
                                       ${segment.population0*100-1},2
                                       ${segment.time0*100-1},${DETAIL_GRAPH_RATIO*100-2}`"
                             />
                </g>
                </template>
                </g>
                <g>
                    <rect v-for="segment in segments" class="details-graph-popbar" :class="segment.speed"
                          x="0"
                          y="0"
                          :width="segment.population1*100"
                          height="3"
                          rx="1.5"
                          ry="1.5"
                          />
                </g>
                <g>
                    <rect v-for="segment in segments" class="details-graph-popbar" :class="segment.speed"
                          x="0"
                          :y="DETAIL_GRAPH_RATIO*100-3"
                          :width="segment.time1*100"
                          height="3"
                          rx="1.5"
                          ry="1.5"
                          />
                </g>
            </svg>
        </div>
        <div class="tag-container">
            <span v-for="(segment, i) in segments"
                  class="time-tag"
                  :class="{ focused: focusedSegment === i }"
                  :style="{ right: collapsed ? `${100-segment.population1*100}%`
                                             : `${100-segment.time1*100}%`}"
                  v-html="formatTime(segment.time, 'm')"
                  />
        </div>
    </div>
</template>

<script setup lang="ts">
import * as T from '@/scripts/types.ts';
import { ref, computed, onUnmounted } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { formatNumber, formatTime } from '@/scripts/utils.ts';
import type { Ref } from 'vue';


const DETAIL_GRAPH_RATIO = .25;


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


const collapsed = ref<boolean>(true);

const focusedSegment = ref<number>();


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

            if (nextStatIdx >= props.stats.length) return ret;
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

const segments = computed(() => {
    const ret: {
    population0: number, population1: number, population: number,
    time0: number, time1: number, time: number,
    speed: string,
    }[] = [];
    if (milestones.value.length === 0) return ret;

    const maxTime = milestones.value.at(-1)!.time;
    const maxPopulation = milestones.value.at(-1)!.population;

    let prevTime = 0, prevPopulation = 0;
    for (const { time, population, speed } of milestones.value) {
        ret.push({
            population0: prevPopulation/maxPopulation,
            population1: population/maxPopulation,
            time0: prevTime/maxTime,
            time1: time/maxTime,
            population,
            time,
            speed,
        });
        prevTime = time;
        prevPopulation = population;
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
    outline: none;
}

#card-frame:focus-within #header-frame {
    outline: auto;
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
    position: relative;
    width: 16em;
    border: 1px var(--bg-alt-color) solid;
    border-radius: 0.48em;
    padding: 0.16em;
    background: var(--bg-color);
    height: calc(16em * v-bind(DETAIL_GRAPH_RATIO));
    overflow: clip;
    transition: height 0.3s;
}

#details-frame.collapsed {
    height: 0.48em;
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

#pin:hover {
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

.details-graph-popbar,
.details-graph-segment {
    stroke: var(--bg-color);
    stroke-width: 0.1;
}

.details-graph-popbar:not(:first-child),
.details-graph-segment:not(:first-child) {
    filter: drop-shadow(1px 0 0.5px #0004);
}

.details-graph-segment {
    opacity: 1;
    transition: opacity .2s;
}
.details-graph-segment.hidden {
    opacity: 0;
}

.details-graph-segment       .fast { fill: #3848; }
.details-graph-segment:hover .fast { fill: #384; }
.details-graph-segment       .slow { fill: #3878; }
.details-graph-segment:hover .slow { fill: #387; }

.details-graph-popbar.fast       { fill: #384; }
.details-graph-popbar.slow       { fill: #387; }

img {
    height: 0.75em;
    transform: scale(1.5);
}

.tag-container {
    position: relative;
    width: 16em;
}

.tag-container-population {
    z-index: 1;
    top: 0.8em;
}

.time-tag {
    position: absolute;
    padding: .25em .5em 0 .5em;
    border-radius: .5em 0 .5em .5em;
    box-shadow: .0em 0 .4em #0008;
    background: var(--bg-alt-color);
    opacity: 0.9;
    text-wrap: nowrap;
    transition: right 0.3s;
}

.time-tag:hover,
.time-tag:active,
.time-tag:focus,
.time-tag.focused {
    z-index: 1;
    opacity: 1;
    box-shadow: .0em 0 .6em #000;
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


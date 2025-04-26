<template>
    <div id="card-frame" tabindex="0"
         @focusin="onfocusin"
         @focusout="onfocusout">
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
                    {{ Boost.getDescription(boost.id) }}
                </div>
            </div>
        </div>
        <div v-if="!collapsed" class="tag-container-population">
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
                    <rect v-for="segment in segments"
                          class="details-graph-bar" :class="segment.speed"
                          x="0" y="0" height="3" rx="1.5" ry="1.5"
                          :width="segment.population1*100"
                          />
                </g>
                <g>
                    <rect v-for="segment in segments"
                          class="details-graph-bar" :class="segment.speed"
                          x="0" height="3" rx="1.5" ry="1.5"
                          :y="DETAIL_GRAPH_RATIO*100-3"
                          :width="segment.time1*100"
                          />
                </g>
            </svg>
            <button v-if="timerData.length"
                    id="timer-button"
                    :class="{ hidden: collapsed }"
                    @click="timerToggle">
                {{ timer.isRunning.value ? `${formatTime(timer.elapsed.value)}` : 'start' }}
            </button>
        </div>
        <div class="tag-container-time">
            <span v-for="(segment, i) in segments.filter(x => x.time)"
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
import { formatNumber, formatTime, clamp } from '@/scripts/utils.ts';
import * as Boost from '@/scripts/boosts.ts';
import type { Ref } from 'vue';


const DETAIL_GRAPH_RATIO = .30;


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


const focused = ref<boolean>(false);
let debounceTimer: ReturnType<typeof setTimeout>;
function onfocusin() {
    clearTimeout(debounceTimer);
    focused.value = true;
}
function onfocusout() {
    debounceTimer = setTimeout(() => focused.value = false, 100);
}
const collapsed = computed(() => !focused.value && !timer.isRunning.value);

const focusedSegment = ref<number>();


const tokenCost = computed(() => {
    let tot = 0;
    for (const b of props.boosts) {
        tot += Boost.getTokenCost(b.id)*(b.amount ?? 1)*(b.streamlined ?? 1);
    }
    return tot;
});

const geCost = computed(() => {
    let tot = 0;
    for (const b of props.boosts) {
        tot += Boost.getGECost(b.id)*(b.amount ?? 1)*(b.streamlined ?? 1);
    }
    return tot;
});

type Milestone = {
    time: number,
    population: number,
    speed: 'fast'|'slow',
    type: 'artiswap'|'boostswap'|'boostend'|'filled',
};

const milestones = computed<Milestone[]>(() => {
    // Find the times when the boost state changes
    const times: number[] = [];
    const startTimes: number[] = [];
    for (const boost of props.boosts) {
        const duration = Boost.getDuration(boost.id);
        for (let i = 1; i <= (boost.streamlined ?? 1); i++) {
            if (!times.includes(duration*i)) times.push(duration*i);
        }
        for (let i = 1; i < (boost.streamlined ?? 1); i++) {
            if (!startTimes.includes(duration*i)) startTimes.push(duration*i);
        }
    }
    times.sort((a,b) => a-b);

    const ret: Milestone[] = [];

    let nextStatIdx = 0;
    let ihr = 0, habCapacity = 0;

    // At each time threshold, calculate the increased population
    let population = Math.max(props.startPopulation ?? 0, 0), prevTime = 0;

    while (population >= habCapacity) {
        if (nextStatIdx === props.stats.length) return ret;
        ihr = props.stats[nextStatIdx].ihr;
        habCapacity = props.stats[nextStatIdx].habCapacity;
        nextStatIdx++;
    }

    for (const time of times) {
        // step between prevTime and time
        let totalTachyon = 0;
        let totalBoost = 0;
        for (const boost of props.boosts) {
            if (Boost.getDuration(boost.id)*(boost.streamlined ?? 1) < time) continue;

            if (Boost.isTachyon(boost.id)) {
                totalTachyon += Boost.getMultiplier(boost.id)*(boost.amount ?? 1);
            } else if (Boost.isBoostBeacon(boost.id)) {
                totalBoost += Boost.getMultiplier(boost.id)*(boost.amount ?? 1);
            }
        }
        // no more tachyons? we're done.
        if (!totalTachyon) break;
        const boostBonus = (totalTachyon || 1)*(totalBoost || 1);
        const speed = totalBoost ? 'fast' : 'slow';


        while (true) {
            const filledTime = prevTime + (habCapacity - population)/(boostBonus*ihr*props.dili);
            if (filledTime >= time) break;

            // Milestone: Hab capacity reached + potential artifact swap
            population = habCapacity;
            prevTime = filledTime;

            if (nextStatIdx === props.stats.length) {
                // Milestone: We're out of IHR sets, we're done
                ret.push({ population: habCapacity, time: filledTime*props.dili, speed, type: 'filled' });
                return ret;
            }

            // Milestone: Move to next IHR set
            ret.push({ population: habCapacity, time: filledTime*props.dili, speed, type: 'artiswap' });
            ihr = props.stats[nextStatIdx].ihr;
            habCapacity = props.stats[nextStatIdx].habCapacity;
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

type Segment = {
    population0: number, population1: number, // population ratio on the graph
    population: number, // actual population
    time0: number, time1: number, // time ratio on the graph
    time: number, // actual time
    speed: ''|'fast'|'slow',
};

const segments = computed<Segment[]>(() => {
    const ret: Segment[] = [];
    if (milestones.value.length === 0) return ret;

    const maxTime = milestones.value.at(-1)!.time;
    const maxPopulation = props.stats.at(-1)!.habCapacity; // stats not empty when milestones not empty

    let prevTime = 0, prevPopulation = clamp(props.startPopulation ?? 0, 0, maxPopulation);

    if (prevPopulation > 0) {
        ret.push({
            population0: 0,
            population1: prevPopulation/maxPopulation,
            time0: 0,
            time1: 0,
            population: prevPopulation,
            time: 0,
            speed: '',
        });
    }

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

    if (ret.length === 0 && milestones.value.length > 0) {
        ret.push({ time: milestones.value.at(-1)!.time*60, title: "⏱️ eica - Boosts have expired" });
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

img {
    height: 0.75em;
    transform: scale(1.5);
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

.details-graph-bar,
.details-graph-segment {
    stroke: var(--bg-color);
    stroke-width: 0.1;
}

.details-graph-bar:not(:first-child),
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

.details-graph-segment             { fill: #8888; }
.details-graph-segment:hover       { fill: #888; }
.details-graph-segment       .fast { fill: #3848; }
.details-graph-segment:hover .fast { fill: #384; }
.details-graph-segment       .slow { fill: #3878; }
.details-graph-segment:hover .slow { fill: #387; }

.details-graph-bar      { fill: #888; }
.details-graph-bar.fast { fill: #384; }
.details-graph-bar.slow { fill: #387; }

.tag-container-time {
    position: relative;
    width: 16em;
}

.tag-container-population {
    position: relative;
    width: 16em;
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
    z-index: 2;
    opacity: 1;
    box-shadow: .0em 0 .6em #000;
}

#timer-button {
    position: absolute;
    bottom: 0;
    left: 0;
    padding: 0.16em 0.4em 0 .4em;
    height: 1.2em;
    min-width: 1.2em;
    border-radius: 0 0.4em;
    font: inherit;
    opacity: 1;
    transition: all .15s;
}

#timer-button.hidden {
    opacity: 0;
}

</style>


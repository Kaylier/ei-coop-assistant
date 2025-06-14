<template>
    <div id="card-frame" @focusin="focused = true" @focusout="focused = false">
        <div id="header-frame" @mousedown="expanded = timer.isRunning.value || !expanded">
            <button v-if="pinned !== undefined || frozenProps" id="pin"
                    title="Mark as favourite"
                    @click="(e: Event) => emit('changed', !!frozenProps || !pinned)">
                {{ frozenProps ? '🔒' : pinned ? '★' : '☆' }}
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
                <div v-for="boost in boosts" class="boost">
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
                <g> <!-- Middle segments -->
                    <polygon v-for="(segment, i) in segments"
                             class="details-graph-segment"
                             :class="[collapsed ? 'hide' : '', segment.speed]"
                             :points="`${segment.time1*100-1},${DETAIL_GRAPH_RATIO*100-2}
                                       ${segment.population1*100-1},2
                                       ${segment.population0*100-1},2
                                       ${segment.time0*100-1},${DETAIL_GRAPH_RATIO*100-2}`"
                             @mouseenter="focusedSegment = i"
                             @touchstart="focusedSegment = i"
                             @mouseleave="focusedSegment = undefined"
                             @touchend="focusedSegment = undefined"
                             />
                </g>
                <g> <!-- Images -->
                <template v-for="(segment, i) in segments">
                    <image v-if="segment.img"
                           :class="{ focused: focusedSegment === i }"
                           :href="segment.img"
                           :x="segment.time1*90 + segment.population1*10 - 4"
                           :y="DETAIL_GRAPH_RATIO*80 - 2.5"
                           height="5" width="5"
                           />
                </template>
                </g>
                <g v-if="timer.isRunning.value"> <!-- Progress segment -->
                    <polygon class="details-graph-progress-segment"
                             :points="`${timer.pTime*100-1},${DETAIL_GRAPH_RATIO*100-2}
                                       ${timer.pPopulation*100-1},2
                                       ${0},2
                                       ${0},${DETAIL_GRAPH_RATIO*100-2}`"
                             />
                </g>
                <g> <!-- Population bar -->
                    <rect v-for="segment in segments"
                          class="details-graph-bar" :class="segment.speed"
                          x="0" y="0" height="3" rx="1.5" ry="1.5"
                          :width="segment.population1*100"
                          />
                </g>
                <g> <!-- Time bar -->
                    <rect v-for="segment in segments"
                          class="details-graph-bar" :class="segment.speed"
                          x="0" height="3" rx="1.5" ry="1.5"
                          :y="DETAIL_GRAPH_RATIO*100-3"
                          :width="segment.time1*100"
                          />
                </g>
            </svg>
        </div>
        <button v-if="notifications.length"
                id="timer-button"
                @click="timerToggle">
            {{ timer.isRunning.value ? `${formatTime(timer.elapsed.value)}` : 'start' }}
        </button>
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
import { focusRef } from '@/scripts/settings.ts';
import * as Boost from '@/scripts/boosts.ts';
import type { Ref } from 'vue';


// Aspect ratio of detailed graph
const DETAIL_GRAPH_RATIO = .30;


const emit = defineEmits<{
    (e: 'changed', value: boolean): void
}>();


const props = defineProps<{
    boosts: { id: T.Boost, amount?: number, streamlined?: number }[],
    stats: { ihr: number, habCapacity: number }[], // ihr in /min
    dili: number,
    startPopulation?: number,
    pinned?: boolean, // not shown if undefined
}>();

// When a timer is started, the current state is frozen
const frozenProps = ref<null | {
    boosts: typeof props.boosts;
    stats: typeof props.stats;
    dili: number;
    startPopulation?: number;
    pinned?: boolean;
}>(null);

const boosts = computed(() => (frozenProps.value ? frozenProps.value : props).boosts);
const stats  = computed(() => (frozenProps.value ? frozenProps.value : props).stats);
const dili   = computed(() => (frozenProps.value ? frozenProps.value : props).dili);
const startPopulation = computed(() => (frozenProps.value ? frozenProps.value : props).startPopulation);
const pinned = computed(() => (frozenProps.value ? frozenProps.value : props).pinned);


// Logic for expanding to detailed view
const expanded = ref<boolean>(false);
const focused = focusRef();
const collapsed = computed<boolean>(() => !expanded.value && !focused.value && !timer.isRunning.value);

const focusedSegment = ref<number>();


const tokenCost = computed(() => {
    let tot = 0;
    for (const b of boosts.value) {
        tot += Boost.getTokenCost(b.id)*(b.amount ?? 1)*(b.streamlined ?? 1);
    }
    return tot;
});

const geCost = computed(() => {
    let tot = 0;
    for (const b of boosts.value) {
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
    for (const boost of boosts.value) {
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
    let population = Math.max(startPopulation.value ?? 0, 0), prevTime = 0;

    while (population >= habCapacity) {
        if (nextStatIdx === stats.value.length) return ret;
        ihr = stats.value[nextStatIdx].ihr;
        habCapacity = stats.value[nextStatIdx].habCapacity;
        nextStatIdx++;
    }

    for (const time of times) {
        // step between prevTime and time
        let totalTachyon = 0;
        let totalBoost = 0;
        for (const boost of boosts.value) {
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
            const filledTime = prevTime + (habCapacity - population)/(boostBonus*ihr*dili.value);
            if (filledTime >= time) break;

            // Milestone: Hab capacity reached + potential artifact swap
            population = habCapacity;
            prevTime = filledTime;

            if (nextStatIdx === stats.value.length) {
                // Milestone: We're out of IHR sets, we're done
                ret.push({ population: habCapacity, time: filledTime*dili.value, speed, type: 'filled' });
                return ret;
            }

            // Milestone: Move to next IHR set
            ret.push({ population: habCapacity, time: filledTime*dili.value, speed, type: 'artiswap' });
            ihr = stats.value[nextStatIdx].ihr;
            habCapacity = stats.value[nextStatIdx].habCapacity;
            nextStatIdx++;
        }

        // Milestone: boost state change
        population += boostBonus*ihr*(time - prevTime)*dili.value;
        prevTime = time;

        const type = startTimes.includes(time) ? 'boostswap' : 'boostend';
        ret.push({ population, time: time*dili.value, speed, type });
    }

    return ret;
});



// Visual segments used for showing population and time progress
type Segment = {
    population0: number, population1: number, // population ratios on the graph
    population: number, // actual population
    time0: number, time1: number, // time ratios on the graph
    time: number, // actual time
    speed: ''|'fast'|'slow',
    img?: string,
};

const segments = computed<Segment[]>(() => {
    const ret: Segment[] = [];
    if (milestones.value.length === 0) return ret;

    const maxTime = milestones.value.at(-1)!.time;
    const maxPopulation = stats.value.at(-1)!.habCapacity; // stats not empty when milestones not empty

    let prevTime = 0, prevPopulation = clamp(startPopulation.value ?? 0, 0, maxPopulation);

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

    for (const { time, population, speed, type } of milestones.value) {
        ret.push({
            population0: prevPopulation/maxPopulation,
            population1: population/maxPopulation,
            time0: prevTime/maxTime,
            time1: time/maxTime,
            population,
            time,
            speed,
            img: type === 'artiswap'  ? '/img/icons/gusset-swap.png' :
                 type === 'boostswap' ? '/img/icons/boost-swap.png' :
                 undefined,
        });
        prevTime = time;
        prevPopulation = population;
    }
    return ret.reverse();
});


// Notification data, time in second since timer start
const notifications = computed<{ time: number, title: string, msg?: string }[]>(() => {
    const ret = [];

    for (const milestone of milestones.value) {
        let time = milestone.time, title, msg;
        switch (milestone.type) {
            case 'filled':
                title = "⏱️ eica - Habs filled";
                break;
            case 'artiswap':
                // remove 5s to give some margin
                time -= 5/60;
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
    notifications: { time: number, title?: string, msg?: string }[], // frozen notification data
    pPopulation: number, // proportion of total population reached
    pTime: number, // proportion of total time reached
} = { elapsed: ref(0), isRunning: ref(false), intervalId: null, startTimestamp: 0, notifications: [], pPopulation: 0,
pTime: 0 };

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
        frozenProps.value = null;
        if (timer.intervalId != null) {
            clearInterval(timer.intervalId);
            timer.intervalId = null;
        }
        timer.pTime = 0;
        timer.pPopulation = 0;
    } else {
        // start timer
        if (canNotify && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        timer.notifications = notifications.value;
        if (timer.notifications.length === 0) return;

        console.log("Start timer", timer.notifications);
        timer.isRunning.value = true;
        frozenProps.value = {
            boosts: props.boosts.map(b => ({ ...b })),
            stats:  props.stats.map(s => ({ ...s })),
            dili: props.dili,
            startPopulation: props.startPopulation,
            pinned: true,
        };
        emit('changed', true);
        timer.elapsed.value = 0;
        timer.startTimestamp = Date.now();
        timer.intervalId = window.setInterval(timerUpdate, 1000);
        timerUpdate();
    }
}

function timerUpdate() {
    const elapsed = (Date.now() - timer.startTimestamp)/1000;
    timer.elapsed.value = elapsed;

    timer.pTime = elapsed/(milestones.value.at(-1)?.time ?? 0)/60;
    for (const segment of segments.value) {
        if (timer.pTime < segment.time0) continue;
        const p = (timer.pTime - segment.time0)/(segment.time1 - segment.time0);
        timer.pPopulation = p*(segment.population1 - segment.population0) + segment.population0;
        break;
    }

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
    cursor: pointer;
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
.details-graph-segment.hide {
    opacity: 0;
}

.details-graph-segment            { fill: #8888; }
.details-graph-segment:hover      { fill: #888; }
.details-graph-segment.fast       { fill: #3848; }
.details-graph-segment.fast:hover { fill: #384; }
.details-graph-segment.slow       { fill: #3878; }
.details-graph-segment.slow:hover { fill: #387; }

.details-graph-progress-segment {
    fill: #8884;
    stroke: var(--valid-color);
    stroke-width: 0.5;
    pointer-events: none;
}

.details-graph-bar      { fill: #888; }
.details-graph-bar.fast { fill: #384; }
.details-graph-bar.slow { fill: #387; }

svg image {
    pointer-events: none;
    opacity: 0.5;
}

svg image.focused {
    opacity: 1;
}

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
    border-radius: v-bind(collapsed ? '0.4em' : '0') 0.4em 0 0.4em;
    font: inherit;
    opacity: 1;
    transition: all .15s;
}

#timer-button.hide {
    opacity: 0;
}

</style>


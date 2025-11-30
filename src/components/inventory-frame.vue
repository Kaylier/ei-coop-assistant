<template>
    <div class="frame" ref="frame"
         :style="frameStyles"
         tabindex="0"
         @keydown="handleKeydown"
         @focus="changeFocus(sandboxLink ? -1 : 0)"
         @blur="changeFocus()">
        <a v-if="sandboxLink" :href="sandboxLink" target='_blank'
           class="sandbox-link"
           title="Open in sandbox"
           tabindex="-1">
            <img src="/img/icons/sandbox.png" alt="🔗"/>
        </a>
        <div v-for="(item, index) in artifacts"
             class="subframe" :class="{ 'emptyframe': !isSet && !item, 'focused': index === currentFocusIndex }"
             @click="changeFocus(index)">
            <item-frame v-if="item" :item="item" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue';
import * as T from '@/scripts/types.ts';
import { getSandboxLink } from '@/scripts/api.ts';

const props = defineProps<{
    artifacts: T.Item[],
    isSet?: boolean,
    deflectorBonus?: number,
    userData?: T.UserData,
    boosts?: T.BoostCategory[],
    column?: number,
    row?: number,
    virtue?: boolean,
    enlightenment?: boolean,
}>();

const sandboxLink = ref<string | null>(null);
const previousFocusIndex = ref<number | null>(null);
const currentFocusIndex = ref<number>(-1);
const frame = ref<HTMLElement | null>(null);

const gridDimensions = computed(() => {
    let columns = props.column;
    let rows = props.row;
    if (columns === undefined && rows === undefined) {
        rows = Math.ceil(Math.sqrt(props.artifacts.length));
        columns = Math.ceil(props.artifacts.length / rows);
    } else if (columns === undefined && rows !== undefined) {
        columns = Math.ceil(props.artifacts.length / rows);
    } else if (columns !== undefined && rows === undefined) {
        rows = Math.ceil(props.artifacts.length / columns);
    }
    return { columns, rows } as { columns: number, rows: number };
});

const frameStyles = computed(() => ({
    gridTemplateColumns: `repeat(${gridDimensions.value.columns}, 1fr)`,
    gridTemplateRows   : `repeat(${gridDimensions.value.rows   }, 1fr)`,
}));

async function handleKeydown(event: KeyboardEvent) {
    const { key } = event;
    const { columns } = gridDimensions.value;

    // sandbox link is treated as index -1
    const minIndex = sandboxLink.value ? -1 : 0;
    const maxIndex = props.artifacts.length - 1;
    let newIndex = currentFocusIndex.value;

    switch (key) {
        case 'ArrowRight':
            // Move right to the first non-empty slot, with wrapping to next line
            if (newIndex < maxIndex)
                newIndex += 1;
            while (!props.artifacts[newIndex] && newIndex < maxIndex) {
                newIndex += 1;
            }
            break;
        case 'ArrowLeft':
            // Move left to the first non-empty slot, with wrapping to previous line
            if (minIndex < newIndex)
                newIndex -= 1;
            while (!props.artifacts[newIndex] && minIndex < newIndex) {
                newIndex -= 1;
            }
            break;
        case 'ArrowDown':
            // Move down, and then left to the first non-empty slot encountered
            newIndex += columns;
            if (newIndex > props.artifacts.length)
                newIndex = props.artifacts.length-1;
            while (!props.artifacts[newIndex] && minIndex < newIndex) {
                newIndex -= 1;
            }
            break;
        case 'ArrowUp':
            // Move up, then left to the first non-empty slot encountered
            newIndex -= columns;
            if (newIndex < minIndex)
                newIndex = minIndex;
            while (!props.artifacts[newIndex] && minIndex < newIndex) {
                newIndex -= 1;
            }
            break;
        case 'Enter':
            if (currentFocusIndex.value === -1) {
                frame.value?.querySelector('a')?.click();
            }
            break;
        default:
            return;
    }

    if (await changeFocus(newIndex))
        event.preventDefault();
}

async function changeFocus(index?: number) {
    if (index === currentFocusIndex.value) return false;
    previousFocusIndex.value = currentFocusIndex.value;
    currentFocusIndex.value = index !== undefined ? index : -1;

    await nextTick();
    if (!frame.value) return false;

    const subframes = frame.value.querySelectorAll('.subframe');
    const prevIndex = previousFocusIndex.value;
    const currIndex = currentFocusIndex.value;

    if (prevIndex !== null) {
        subframes[prevIndex]?.querySelector('.item-frame')?.dispatchEvent(new Event('blur'));
    }

    if (currIndex !== null) {
        const currItem = subframes[currIndex]?.querySelector('.item-frame');
        if (currItem) {
            currItem.dispatchEvent(new Event('focus'));

            subframes[currIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'nearest'
            });
        }
    }
    return true;
}

watch(() => [props.artifacts, props.deflectorBonus], updateSandboxLink, { immediate: true });

async function updateSandboxLink() {
    if (!props.isSet) return;
    try {
        sandboxLink.value = await getSandboxLink(props.artifacts as T.Artifact[],
                                                 props.userData, {
                                                 deflectorBonus: props.deflectorBonus,
                                                 boosts: props.boosts,
                                                 virtue: props.virtue,
                                                 enlightenment: props.enlightenment,
                                                 });
    } catch {
        sandboxLink.value = null;
    }
}
</script>

<style scoped>
.frame {
    position: relative;
    align-self: stretch;
    display: grid;
    height: auto;
    gap: min(0.5vw, 0.4em);
    padding: min(0.5vw, 0.4em);
    overflow: auto clip;
    background: var(--bg-hover-color);
    border-radius: 1em;
}

.subframe {
    background: var(--bg-alt-color);
    border-radius: 1em;
    max-width: 4.5rem;
    max-height: 4.5rem;
    aspect-ratio: 1/1;
}

.subframe.focused {
    outline: auto;
}

.emptyframe {
    visibility: hidden;
    aspect-ratio: 1;
}

.sandbox-link {
    position: absolute;
    top: 0.2em;
    left: 0.2em;
    font-size: 0.75em;
    text-decoration: none;
    width: 2em;
    height: 2em;
    text-align: left;
    z-index: 1;
}

.sandbox-link img {
    width: 1.1em;
    height: 1.1em;
}

</style>

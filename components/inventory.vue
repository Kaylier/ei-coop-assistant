<template>
    <div class="frame" :style="frameStyles">
        <a v-if="sandboxLink" :href="sandboxLink" class="sandbox-link" target='_blank' title="Open in sandbox">
            <img src="/img/icons/sandbox.png" alt="🔗"/>
        </a>
        <div v-for="item in artifacts" class="subframe" :class="{ 'emptyframe': !isSet && !item }">
            <item-view v-if="item" :item="item"></item-view>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { getSandboxLink } from '/scripts/api.ts';

const props = defineProps<{
    artifacts: Item[],
    isSet: bool | undefined,
    deflectorBonus: float | undefined,
    proPermit: bool | undefined,
    column: number | undefined,
    row: number | undefined,
}>();

const sandboxLink = ref(null);

const frameStyles = computed(() => {
    let columns = props.column;
    let rows = props.row;
    if (columns === undefined && rows === undefined) {
        rows = Math.ceil(Math.sqrt(props.artifacts.length));
        columns = Math.ceil(props.artifacts.length / rows);
    } else if (columns === undefined) {
        columns = Math.ceil(props.artifacts.length / rows);
    } else if (rows === undefined) {
        rows = Math.ceil(props.artifacts.length / columns);
    }
    return {
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
    };
});

watch(() => [props.artifacts, props.deflectorBonus], updateSandboxLink, { immediate: true });

async function updateSandboxLink() {
    if (!props.isSet)
        return;
    try {
        sandboxLink.value = await getSandboxLink(props.artifacts, props.deflectorBonus, props.proPermit); 
    } catch (e) {
        sandboxLink.value = null;
    }
}
</script>

<style scoped>
.frame {
    position: relative;
    display: grid;
    height: auto;
    gap: calc(2px + 0.2vw);
    padding: calc(2px + 0.2vw);
    overflow: auto clip;
    background: var(--bg-hover-color);
    border-radius: 1em;
}

.subframe {
    background: var(--bg-alt-color);
    border-radius: 1em;
    aspect-ratio: 1;
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

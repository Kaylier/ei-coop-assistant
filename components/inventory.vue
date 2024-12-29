<template>
    <div class="frame" :style="frameStyles">
        <div v-for="item in artifacts" :class="item ? 'subframe' : 'emptyframe'">
            <item-view v-if="item" :item="item"></item-view>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    artifacts: Item[],
    column: number | undefined,
    row: number | undefined,
}>();

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
</script>

<style scoped>
.frame {
    display: grid;
    height: auto;
    gap: calc(1px + 0.3vw);
    padding: calc(3px + 0.3vw);
    overflow: scroll;
    background: #404040;
    border-radius: 1em;
}

.subframe {
    background: #333333;
    border-radius: 1em;
    aspect-ratio: 1;
}

.emptyframe {
    visibility: hidden;
}

</style>

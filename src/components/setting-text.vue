<template>
    <span class="setting-entry">
        <label>
            <span v-if="tooltip" tabindex="0" class="tooltip-icon">
                ⓘ
                <span class="tooltip-text" v-html="tooltip"/>
            </span>
            <label :for="id" v-html="label"/>
        </label>
        <input type="text" :id="id"
               :class="{ invalid: !unref(setting.isValid) }"
               v-model="setting.text"
               :placeholder="unref(setting.placeholder)"/>
    </span>
</template>

<script setup lang="ts">
import { computed, unref } from 'vue';
import type { TextInputSetting } from '@/scripts/settings.ts';

const setting = defineModel<TextInputSetting<any>>({ required: true });

const props = defineProps<{
    id: string,
    label: string,
    tooltip?: string,
}>();

</script>

<style scoped>

.setting-entry {
    display: flex;
    align-items: center;
    gap: 0.2em;
}

input {
    width: 7em;
}

</style>

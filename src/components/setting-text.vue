<template>
    <span class="setting-entry" :class="{ hidden: hide && setting.value === setting.defaultValue }">
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
               :placeholder="unref(setting.placeholder)">
    </span>
</template>

<script setup lang="ts">
import { unref } from 'vue';
import type { TextInputSetting } from '@/scripts/settings.ts';

const setting = defineModel<TextInputSetting<unknown>>({ required: true });

defineProps<{
    id: string,
    label: string,
    tooltip?: string,
    hide?: boolean,
}>();

</script>

<style>

.setting-entry {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    gap: 0.2em;
}

.hidden:not(:focus-within) {
    display: none;
}

.setting-entry input {
    width: 7em;
}

</style>

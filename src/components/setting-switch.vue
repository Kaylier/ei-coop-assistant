<template>
    <span class="setting-entry">
        <label v-if="label || tooltip">
            <span v-if="tooltip" tabindex="0" class="tooltip-icon">
                ⓘ
                <span class="tooltip-text" v-html="tooltip"/>
            </span>
            <label v-if="label" v-html="label"/>
        </label>
        <div class="switch">
            <label v-for="option in options"
                   class="switch-option"
                   :for="`${id}-${option.value}`">
                <input type="radio"
                       :name="id"
                       :id="`${id}-${option.value}`"
                       :value="option.value"
                       v-model="setting.value"/>
                <slot name="option" v-bind="option">
                    <span v-html="option.label"/>
                </slot>
            </label>
            <slot name="extra"/>
        </div>
    </span>
</template>

<script setup lang="ts">
import type { SwitchSetting } from '@/scripts/settings.ts';

const setting = defineModel<SwitchSetting<unknown>>({ required: true });

defineProps<{
    id: string,
    label: string,
    tooltip?: string,
    options: Array<{ value: unknown, label: string }>,
}>();

</script>

<style>

.setting-entry {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    gap: 0.2em;
}

.switch {
    display: flex;
    flex-flow: row nowrap;
    background-color: var(--bg-alt-color);
    border-radius: 4px;
    padding: 0.2em;
    height: 1.6em;
    align-self: flex-end;
}

.switch.disabled {
    color: var(--placeholder-color);
    pointer-events: none;
}

.switch input {
    position: absolute;
    opacity: 0;
    z-index: -1;
}

.switch:focus-within {
    box-shadow: 0 0 0.25em var(--valid-color) inset;
}

.switch-option {
    border: none;
    transition: background-color 0.15s;
    cursor: pointer;
    align-content: center;
    text-decoration: none;
    height: 100%;
}

.switch-option:focus-within {
    box-shadow: 0 0 0.25em var(--valid-color) inset;
}

.switch-option * {
    padding: 0.2em 0.6em;
}

.switch-option img {
    padding: 0 0.4em;
    aspect-ratio: 1;
    height: 100%;
}

.switch-option:first-child {
    border-radius: 3px 0 0 3px;
}

.switch-option:last-child {
    border-radius: 0 3px 3px 0;
}

.switch-option:hover,
.switch-option:focus {
    background-color: var(--bg-alt-hover-color);
}

.switch-option:has(input:checked) {
    background-color: var(--active-color);
}

.switch-option:has(input:checked):hover,
.switch-option:has(input:checked):focus {
    background-color: var(--active-hover-color);
}


</style>

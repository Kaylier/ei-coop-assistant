<template>
    <span class="setting-entry"
          :class="{ hidden: hide && unref(setting.value) === setting.defaultValue && !focused  }"
          @focusin="onfocusin" @focusout="onfocusout"
          >
        <label v-if="label || tooltip">
            <span v-if="tooltip" tabindex="0" class="tooltip-icon">
                ⓘ
                <span class="tooltip-text" v-html="tooltip"/>
            </span>
            <label v-if="label" v-html="label"/>
        </label>
        <div class="switch">
            <label v-for="option in options"
                   :key="option.value"
                   class="switch-option"
                   :for="`${id}-${String(option.value)}`">
                <input :type="type ?? 'radio'"
                       :name="id"
                       :id="`${id}-${String(option.value)}`"
                       :value="option.value"
                       v-model="setting.value"/>
                <slot name="option" v-bind="option">
                    <img v-if="option.img" :src="option.img" :alt="option.label"/>
                    <span v-else v-html="option.label"/>
                </slot>
            </label>
            <slot name="extra"/>
        </div>
    </span>
</template>

<script setup lang="ts">
import { ref, unref } from 'vue';
import type { Setting } from '@/scripts/settings.ts';

type KeyType = string | number | symbol;

const setting = defineModel<Setting<KeyType>>({ required: true });

defineProps<{
    id: string,
    label?: string,
    tooltip?: string,
    options: Array<{ value: KeyType, label: string, img?: string }>,
    type?: 'radio'|'checkbox',
    hide?: boolean,
}>();

// When changing from default option to non-default one, the focus flickering hides the setting
// We need debouncing to mitigate this
const focused = ref<boolean>(false);
let debounceTimer: ReturnType<typeof setTimeout>;

function onfocusin() {
    clearTimeout(debounceTimer);
    focused.value = true;
}

function onfocusout() {
    debounceTimer = setTimeout(() => focused.value = false, 200);
}

</script>

<style>

.setting-entry {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    gap: 0.2em;
}

.setting-entry.hidden:not(:focus-within) {
    display: none;
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
    height: 0;
    width: 0;
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

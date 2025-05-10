<template>
    <span class="setting-entry" :class="{ hidden: hide && setting.value === setting.defaultValue }"
          role="spinbutton"
          @keydown.up.shift.exact="setting.spin?.(10)"
          @keydown.up.exact="setting.spin?.(1)"
          @keydown.up.ctrl.exact="setting.spin?.(0.1)"
          @keydown.down.ctrl.exact="setting.spin?.(-0.1)"
          @keydown.down.exact="setting.spin?.(-1)"
          @keydown.down.shift.exact="setting.spin?.(-10)"
          >
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
               :placeholder="unref(setting.placeholder)"
               v-bind="$attrs"/>
    </span>
</template>

<script setup lang="ts">
import { unref } from 'vue';
import type { TextInputSetting } from '@/scripts/settings.ts';

const setting = defineModel<TextInputSetting<unknown>>({ required: true });

defineOptions({
  inheritAttrs: false,
})

defineProps<{
    id: string,
    label: string,
    tooltip?: string,
    hide?: boolean,
    small?: boolean,
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
    width: v-bind(small ? '2em' : '7em');
}

input[type=number] {
    -moz-appearance: textfield;
    appearance: textfield;
    margin: 0;
}

input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

</style>

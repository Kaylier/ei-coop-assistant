/*
 * Settings modules management
 */

import { shallowRef, reactive, computed, watch } from 'vue';
import type { Ref, Reactive } from 'vue';

export type TextInputSetting<T> = {
    text: Ref<string>,
    isValid: Ref<boolean>,
    value: Ref<T>,
    placeholder: Ref<string>,
};

/*
 * Create a TextInputSetting, a structure used for text input settings (woaahhh)
 * text is populated by query parameter (if provided), or previously stored localStorage entry (if provided),
 * or default value.
 * If user modifies it to a valid text, it is automatically saved to localStorage, and the value reacts to the change.
 * If the text is invalid, last valid state is kept.
 *
 * Example usage:
 *  <input type="text" id="…"
 *          v-model="setting.text"
 *          :class="{ invalid: !setting.isValid }"
 *          :placeholder="setting.placeholder">
 *
 *  const setting = createTextInputSetting<number>({
 *      localStorageKey: 'key',
 *      queryParamKey: 'key',
 *      defaultValue: 1,
 *      parser: parseNumber, formatter: formatNumber,
 *  });
 *
 *  … = setting.value;
 */
export function createTextInputSetting<T>(options: {
    localStorageKey?: string,
    queryParamKey?: string,
    defaultValue: T,
    parser?: (arg0: string) => T,
    formatter?: (arg0: T) => string,
}): Reactive<TextInputSetting<T>> {

    const { localStorageKey, queryParamKey, defaultValue, parser, formatter } = options;
    const parseValue = parser || ((s: string) => s as unknown as T);
    const formatValue = formatter || ((s: T) => s as unknown as string);

    const stored = localStorageKey ? localStorage.getItem(localStorageKey) : null;

    const urlParams = new URLSearchParams(window.location.search);
    const queryText = queryParamKey ? urlParams.get(queryParamKey) : null;

    const text = shallowRef<string>(queryText ?? stored ?? "");
    const isValid = shallowRef<boolean>(false);
    const value = shallowRef<T>(defaultValue);
    const placeholder = computed(() => formatValue(value.value));

    // Parse the text and update current state (value and isValid)
    function updateValue(save: boolean = true) {
        try {
            const parsed = parseValue(text.value);
            value.value = parsed;
            isValid.value = true;
        } catch {
            isValid.value = false;
        }
        if (localStorageKey && isValid.value && save) {
            localStorage.setItem(localStorageKey, text.value);
        }
    }

    updateValue(false);

    watch(text, (newVal, oldVal) => {
        updateValue();
    });

    return reactive<TextInputSetting<T>>({
        text,
        isValid,
        value,
        placeholder,
  });
}



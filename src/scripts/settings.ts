/*
 * Settings modules management
 */

import { shallowRef, ref, reactive, computed, watch } from 'vue';
import type { Ref, Reactive } from 'vue';

export type Setting<T> = {
    value: Ref<T>,
    defaultValue: T,
};

/**
 * Create a Setting, a generic structure used for managing settings
 * text is populated by query parameter (if provided), or previously stored localStorage entry (if provided),
 * or default value.
 * If user modifies it, it is automatically saved to localStorage, and the value reacts to the change.
 * If conversion to string is not JSON-friendly (eg. with Set), custom parser/formatter function can be provided
 *
 * Example usage:
 *  const setting = createSetting<number>({
 *      localStorageKey: 'key',
 *      queryParamKey: 'key',
 *      defaultValue: 1,
 *  });
 *  setting.value = 5;
 */
export function createSetting<T>(options: {
    localStorageKey?: string,
    queryParamKey?: string,
    defaultValue: T,
    parser?: (arg0: string) => T,
    formatter?: (arg0: T) => string,
}): Reactive<Setting<T>> {
    const { localStorageKey, queryParamKey, defaultValue, parser, formatter } = options;

    const parseValue = parser || JSON.parse;
    const formatValue = formatter || JSON.stringify;

    const storedText = localStorageKey ? localStorage.getItem(localStorageKey) : null;
    const storedValue = storedText ? parseValue(storedText) : null;

    const urlParams = new URLSearchParams(window.location.search);
    const queryText = queryParamKey ? urlParams.get(queryParamKey) : null;
    const queryValue = queryText ? parseValue(queryText) : null;

    const value = shallowRef<T>(queryValue ?? storedValue ?? defaultValue);

    watch(value, () => {
        if (localStorageKey) {
            localStorage.setItem(localStorageKey, formatValue(value.value));
        }
    });

    return reactive<Setting<T>>({
        value,
        defaultValue,
    });
}


export type TextInputSetting<T> = {
    text: Ref<string>,
    isValid: Ref<boolean>,
    value: Ref<T>,
    placeholder: Ref<string>,
    defaultValue: T,
    spin?: (arg0: T) => void,
};

/**
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
    spinner?: (arg0: T, arg1: T) => T,
}): Reactive<TextInputSetting<T>> {
    const { localStorageKey, queryParamKey, defaultValue, parser, formatter, spinner } = options;

    const parseValue = parser || ((s: string) => s as unknown as T);
    const formatValue = formatter || ((s: T) => s as unknown as string);

    const stored = localStorageKey ? localStorage.getItem(localStorageKey) : null;

    const urlParams = new URLSearchParams(window.location.search);
    const queryText = queryParamKey ? urlParams.get(queryParamKey) : null;

    const ephemeral = (queryText != null);

    const text = shallowRef<string>(queryText ?? stored ?? "");
    const isValid = shallowRef<boolean>(false);
    const value = shallowRef<T>(defaultValue);
    const placeholder = computed(() => formatValue(value.value));

    // Parse the text and update current state (value and isValid)
    function updateValue(s: string, save: boolean = true): string {
        try {
            const parsed = parseValue(s);
            value.value = parsed;
            isValid.value = true;
        } catch {
            isValid.value = false;
        }
        if (localStorageKey && isValid.value && save) {
            localStorage.setItem(localStorageKey, s);
        }
        return isValid.value ? s : text.value;
    }

    updateValue(text.value, false);
    watch(text, (s) => updateValue(s, !ephemeral));

    function spin(x: T) {
        if (!text.value || !isValid.value) return;
        text.value = updateValue(formatValue(spinner!(value.value, x)), !ephemeral);
        updateValue(text.value, false);
    }

    return reactive<TextInputSetting<T>>({
        text,
        isValid,
        value,
        placeholder,
        defaultValue,
        spin: spinner ? spin : undefined,
  });
}




export function focusRef(delayin = 200, delayout = 200): Ref<boolean> {
    const inner = ref<boolean>(false);
    let timer: ReturnType<typeof setTimeout>;

    return new Proxy(inner, {
        get(target, prop) {
            return Reflect.get(target, prop);
        },
        set(target, prop, value) {
            if (prop === 'value') {
                clearTimeout(timer);
                if (value) {
                    timer = setTimeout(() => {
                        target.value = value;
                    }, delayin);
                } else {
                    timer = setTimeout(() => {
                        target.value = value;
                    }, delayout);
                }
                return true;
            }
            return Reflect.set(target, prop, value);
        }
    });
}


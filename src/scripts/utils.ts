/*
 * This file contains various generic functions
 */
import * as T from '@/scripts/types.ts';

const units: string[] = [
    '',
    'K', 'M' , 'B' , 'T' , 'q' , 'Q' , 's' , 'S' , 'o' , 'N',
    'd', 'U' , 'D' , 'Td', 'qd', 'Qd', 'sd', 'Sd', 'Od', 'Nd',
    'V', 'uV', 'dV', 'tV', 'qV', 'QV', 'sV', 'SV', 'OV', 'NV',
    'tT'
];


export function checkEID(eid: string): boolean {
    return /^\s*EI\d{16}\s*$/.test(eid) || checkSID(eid);
}

export function checkSID(eid: string): boolean {
    return /^\s*SI\d+\s*$/.test(eid);
}

/**
 * Parse a number from a game format string
 */
export function parseNumber(s: string): number {
    s = s.replace(/[\s,]+/g, '');

    const match = s.match(/^(\d*\.?\d+(?:e-?[0-9]+)?)([a-zA-Z]+)?$/);
    if (!match) {
        throw new Error(`Invalid number format: ${s}`);
    }
    const num = parseFloat(match[1]);
    const unit = match[2] || '';

    const index = units.indexOf(unit);
    if (index === -1) {
        throw new Error(`Unknown unit: ${unit}`);
    }

    return num*Math.pow(1000, index);
}

/**
 * Format a number to a game format string
 */
export function formatNumber(x: number, ...args: Parameters<Number["toLocaleString"]>): string {
    x = Number(x);
    let unit;
    for (unit of units) {
        if (x < 1e3) break;
        x /= 1e3;
    }
    return `${x.toLocaleString(...args)}${unit}`;
}

/**
 * Parse a rate from a game format string
 * Returns a rate per seconds
 * If an empty string is given, returns undefined
 */
export function parseRate(s: string): number | undefined {
    if (s === "")
        return undefined;

    s = s.replace(/[\s,]+/g, '');

    const match = s.match(/^(\d*\.?\d+(?:e-?[0-9]+)?)([a-zA-Z]+)?\/(h|hour|m|min|s)$/);

    if (!match) {
        throw new Error(`invalid rate format: ${s}`);
    }
    const num = parseFloat(match[1]);
    const unit = match[2] || '';
    const timeUnit = match[3];

    const index = units.indexOf(unit);
    if (index === -1) {
        throw new Error(`Unknown unit: ${unit}`);
    }

    const timeScales: { [key: string]: number } = {
        h: 3600,
        hour: 3600,
        m: 60,
        min: 60,
        s: 1,
    };

    const timeScale = timeScales[timeUnit];
    if (!timeScale) {
        throw new Error(`Unknown time unit: ${timeUnit}`);
    }

    return num*Math.pow(1000, index)/timeScale;
}

/**
 * Format a rate to a game format string
 * If no time unit is specified, uses per hour
 */
export function formatRate(x: number, timeUnit: string = 'h'): string {
    x = Number(x);
    switch (timeUnit) {
        case 's':
            break;
        case 'm':
            x *= 60;
            break;
        case 'h':
            x *= 3600;
            break;
        default:
            throw new Error(`invalid unit: '${timeUnit}'`);
    }
    return `${formatNumber(x)}/${timeUnit}`;
}


/*
 * Load a text input setting
 */
export function loadTextInputSetting(setting: T.TextInputSetting, defaultValue: string = "") {
    const stored = setting.localStorageId !== undefined ? localStorage.getItem(setting.localStorageId) : null;
    setting.text = stored !== null ? stored : defaultValue;
    return setting.text;
}

/*
 * Parse a text input setting
 * If the parser raises an exception, the old value is kept and isValid attribute is updated
 */
export function updateTextInputSetting(setting: T.TextInputSetting) {
    try {
        const parsedValue = setting.parser(setting.text);
        setting.validText = true;
        if (setting.localStorageId) localStorage.setItem(setting.localStorageId, setting.text);
        setting.value = parsedValue;
    } catch {
        setting.validText = false;
    }
    return setting.value;
}

export function loadToggleSetting<T>(setting: T.ToggleSetting<T>, defaultValue: T) {
    const stored = setting.localStorageId !== undefined ? localStorage.getItem(setting.localStorageId) : null;
    try {
        const parsed = stored !== null ? setting.parser(stored) : defaultValue;
        setting.value = parsed;
    } catch (e) {
        console.warn(`Failed to parse setting from localStorage:`, e);
    }
    return setting.value;
}

export function updateToggleSetting<T>(setting: T.ToggleSetting<T>) {
    try {
        const formatter = setting.formatter !== undefined ? setting.formatter : JSON.stringify;
        const formatted = formatter(setting.value);
        if (setting.localStorageId) localStorage.setItem(setting.localStorageId, formatted);
    } catch (e) {
        console.warn(`Failed to save setting to localStorage:`, e);
    }
    return setting.value;
}


/**
 */
export function clamp(x: number, min: number, max: number): number {
    return Math.max(Math.min(x, max), min);
}


/**
 * Round float calculations in a controlled manner
 * If two sets have the same bonuses but compounded in a different order, it can result in a slightly different
 * final bonus. One set will then be prioritary over the other, ignoring a preference order that should apply for
 * equal bonuses
 * To mitigate that, I round to 9 digits
 */
export function round(x: number, precision = 1e6): number {
    return Math.round(x*precision)/precision;
}


/**
 * Lexicographical comparison function between arrays
 * For backward compatibility, act like normal comparison if numbers are given
 */
export function arrayCompare(a: number | number[], b: number | number[]) {
    if (typeof a === 'number' && typeof b === 'number') {
        console.log(a, b);
        return a - b;
    }
    const arrA = typeof a === 'number' ? [a] : a;
    const arrB = typeof b === 'number' ? [b] : b;

    const minLength = Math.min(arrA.length, arrB.length);
    for (let i = 0; i < minLength; i++) {
        if (arrA[i] !== arrB[i]) {
            return arrA[i] - arrB[i];
        }
    }
    return arrA.length - arrB.length;
}


/**
 * Extracts the Pareto frontier from a list of (x, y, element) tuples.
 * The frontier consists of non-dominated points.
 * Returns an array of groups, where each group contains elements with the same (x, y) values.
 *
 * Complexity in O(n*log(n)) where n is list.length
 */

export function extractParetoFrontier2<T>(list: [number, number, T][]): T[][] {
    // Sort by x (descending) and then by y (descending)
    const sortedList = list.slice().sort(([ax, ay], [bx, by]) => bx - ax || by - ay);

    const frontier: T[][] = [];
    let lastX = 0, lastY = -Infinity;

    for (const [x, y, element] of sortedList) {
        if (y > lastY) {
            frontier.push([element]);
            lastX = x;
            lastY = y;
        } else if (x === lastX && y === lastY) {
            frontier[frontier.length - 1].push(element);
        }
    }

    return frontier;
}

/*
 * Extracts the Pareto frontier from a list of (x, y, z, element) tuples.
 * The frontier consists of non-dominated points.
 * Returns an array of groups, where each group contains elements with the same (x, y, z) values.
 *
 * Complexity in O(n^2) where n is list.length
 * /!\ This function is significantly slower than extractParetoFrontier
 */
export function extractParetoFrontier3<T>(list: [number, number, number, T][]): T[][] {
    const groups = new Map<string, [number, number, number, T[]]>();
    for (const [a, b, c, element] of list) {
        const key = `${a},${b},${c}`;
        if (!groups.has(key)) {
            groups.set(key, [a, b, c, []]);
        }
        groups.get(key)![3].push(element);
    }
    const elements = Array.from(groups.values())
    return elements.filter(([x,y,z]) =>
        !elements.some(([u,v,w]) => x <= u && y <= v && z <= w && (x < u || y < v || z < w)))
        .map(([, , , elements]) => elements);
}

export function extractParetoFrontier<T>(list: [number[], T][]): T[][] {
    const groups = new Map<string, [number[], T[]]>();

    // Group elements by identical coordinates
    for (const [coords, element] of list) {
        const key = coords.join(':');
        if (!groups.has(key)) {
            groups.set(key, [coords, []]);
        }
        groups.get(key)![1].push(element);
    }

    const elements = Array.from(groups.values());

    // Filter out dominated elements
    return elements.filter(([coords]) =>
            !elements.some(([otherCoords]) =>
                otherCoords.every((v, i) => v >= coords[i]) &&
                otherCoords.some((v, i) => v > coords[i])
            )
        )
        .map(([, elements]) => elements);
}


/**
 * Generates all combinations of a given size from the provided array.
 *
 * Example: combinations(['a', 'b', 'c', 'd'], 3) will yield
 *          ['a', 'b', 'c'], ['a', 'b', 'd'], ['a', 'c', 'd'] and ['b', 'c', 'd']
 *
 * @param array The input array from which to generate permutations.
 * @param size The size of each permutation.
 * @param partials Also returns combinations of lower sizes
 * @returns A generator yielding arrays of elements from the original array.
 */
export function* combinations<T>(array: T[], size: number, partials: boolean = false): Generator<T[], void, void> {
    function* aux(tempArray: T[], startIndex: number, size: number): Generator<T[], void, void> {
        if (tempArray.length === size) {
            yield [...tempArray];
            return;
        } else if (tempArray.length > size) {
            return;
        }

        for (let i = startIndex; i < array.length; i++) {
            tempArray.push(array[i]);
            yield* aux(tempArray, i + 1, size);
            tempArray.pop();
        }
    }

    for (let n = (partials ? 0 : size); n <= size; n++) {
        yield* aux([], 0, n);
    }
}


/**
 * Generates the Cartesian product of multiple arrays.
 *
 * Example: product(['a','b','c'], [1, 2]) will yield
 *          ['a', 1], ['a', 2], ['b', 1], ['b', 2], ['c', 1] and ['c', 2]
 *
 * @param arrays Arrays to generate the Cartesian product from.
 * @yields Arrays of combinations from the Cartesian product.
 */
export function* product<T>(...arrays: T[][]): Generator<T[], void, void> {
    function* aux(index: number, current: T[]): Generator<T[], void, void> {
        if (index === arrays.length) {
            yield current;
            return;
        }

        for (const item of arrays[index]) {
            yield* aux(index + 1, [...current, item]);
        }
    }

    yield* aux(0, []);
}




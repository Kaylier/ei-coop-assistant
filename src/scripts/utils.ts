/*
 * This file contains various generic functions
 */


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
export function formatNumber(x: number, ...args: Parameters<number["toLocaleString"]>): string {
    x = Number(x);
    let unit;
    for (unit of units) {
        // 999.999… to avoid rounding errors
        if (x < 999.999999) break;
        x /= 1e3;
    }
    return `${x.toLocaleString(...args)}${unit}`;
}

/**
 * Parse a rate from a game format string
 * Returns a rate per seconds
 * If an empty string is given, returns undefined
 */
export function parseRate(s: string): number {
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


/**
 * Format a time to a game format string
 * If no time unit is specified, uses seconds
 */
export function formatTime(x: number, timeUnit: string = 's'): string {
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
    if (x < 60*60) {
        const minutes = Math.floor(x/60);
        const seconds = Math.floor(x%60);
        return `${minutes}min ${seconds}s`;
    }
    x /= 60;
    if (x < 24*60) {
        const hours = Math.floor(x/60);
        const minutes = Math.floor(x%60);
        return `${hours}hr${hours > 1 ? 's' : ''} ${minutes}min`;
    }
    x /= 60;
    if (x < 7*24) {
        const days = Math.floor(x/24);
        const hours = Math.floor(x%24);
        return `${days}day${days > 1 ? 's' : ''} ${hours}hr${hours > 1 ? 's' : ''}`;
    }
    const days = Math.floor(x/24);
    return `${days}day${days > 1 ? 's' : ''}`;
}


/**
 */
export function clamp(x: number, min: number, max: number): number {
    return Math.max(Math.min(x, max), min);
}


/**
 * Return true if the values a and b are close to each other and false otherwise.
 */
export function isclose(a: number, b: number, rel_tol: number = 1e-09, abs_tol: number = 0.0): boolean {
    if (Number.isNaN(a) || Number.isNaN(b)) return false;
    if (a === b) return true;
    if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
    return Math.abs(a-b) <= Math.max(rel_tol*Math.max(Math.abs(a), Math.abs(b)), abs_tol);
}


/**
 * Lexicographical comparison function between arrays
 * For backward compatibility, act like normal comparison if numbers are given
 */
export function arrayCompare(a: number | number[], b: number | number[]) {
    if (typeof a === 'number' && typeof b === 'number') {
        return isclose(a, b) ? 0 : a - b;
    }
    const arrA = typeof a === 'number' ? [a] : a;
    const arrB = typeof b === 'number' ? [b] : b;

    const minLength = Math.min(arrA.length, arrB.length);
    for (let i = 0; i < minLength; i++) {
        if (!isclose(arrA[i], arrB[i])) {
            return arrA[i] - arrB[i];
        }
    }
    return arrA.length - arrB.length;
}


/**
 * Group items that have the same coordinate (floating-point aware).
 */
function groupEquivalent<T, C extends number[]>(list: [C, T][]): [C, T[]][] {
    if (list.length == 0) {
        return [];
    }
    let ret: [C, T][][] = [list];

    const countCoords = list[0][0].length;
    for (let i = 0; i < countCoords; i++) {
        ret = ret.flatMap(l => groupby(l, i));
    }

    return ret.map(eq => [eq[0][0], eq.map(([, el]) => el)]);
}

/**
 * Group items that have the same idx coordinate.
 * This is used internally by groupEquivalent. Unlike groupEquivalent, coordinates are kept alongside individual items
 * in the output.
 */
function groupby<T, C extends number[]>(list: [C, T][], idx: number): [C, T][][] {
    const ret: [C, T][][] = [];
    let current: [C, T][] = [];
    let lastCoord: number|null = null;

    list.sort(([ca], [cb]) => ca[idx] - cb[idx]);

    list.forEach(([coords, el]) => {
        if (lastCoord !== null && !isclose(coords[idx], lastCoord)) {
            if (current.length > 1 && !isclose(current[0][0][idx], lastCoord)) {
                console.warn("Abnormal divergence detected in groupby:", current, idx);
            }
            ret.push(current);
            current = [];
        }
        current.push([coords, el]);
        lastCoord = coords[idx];
    });


    if (lastCoord !== null) {
        if (current.length > 1 && !isclose(current[0][0][idx], lastCoord)) {
            console.warn("Abnormal divergence detected in groupby:", current, idx);
        }
        ret.push(current);
    }

    return ret;
}

/**
 * Extracts the Pareto frontier from a list of (x, y, element) tuples.
 * The frontier consists of non-dominated points.
 * Returns an array of groups, where each group contains elements with the same (x, y) values.
 *
 * Complexity in O(n*log(n)) where n is list.length
 */
function extractParetoFrontier2<T>(list: [[number, number], T][]): T[][] {
    // Group by coordinate, sort by x (descending) and then by y (descending)
    const sortedList: [[number, number], T[]][] = groupEquivalent(list)
        .sort(([[ax, ay]], [[bx, by]]) => !isclose(ax, bx) ? bx - ax : by - ay);

    const frontier: T[][] = [];
    let lastY = -Infinity;

    for (const [[, y], element] of sortedList) {
        if (y > lastY && !isclose(y, lastY)) {
            frontier.push(element);
            lastY = y;
        }
    }

    return frontier;
}

/*
 * Extracts the Pareto frontier from a list of (coordinate, element) tuples.
 * The frontier consists of non-dominated points.
 * Returns an array of groups, where each group contains elements with the same coordinate values.
 *
 * Complexity in O(c×n^2) where n is list.length and c is the amount of coordinates
 *
 * For 2 coordinates, deleguates to extractParetoFrontier2 which is in O(n×log(n))
 */
export function extractParetoFrontier<T, C extends number[]>(list: [C, T][]): T[][] {
    if (list.length === 0) return [];
    if (list[0][0].length == 2) return extractParetoFrontier2(list as unknown as [[number, number], T][]);

    const elements: [C, T[]][] = groupEquivalent(list);

    // Filter out dominated elements
    return elements.filter(([coords]) =>
            !elements.some(([otherCoords]) =>
                otherCoords.every((v, i) => v >= coords[i] ||  isclose(v, coords[i])) &&
                otherCoords.some( (v, i) => v >  coords[i] && !isclose(v, coords[i]))
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




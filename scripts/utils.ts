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
 * Parse a string of the form 1.234q/h and return a rate per seconds as a number
 * If an empty string is given, returns undefined
 */
export function parseRateString(s: string): number | undefined {
    if (s === "")
        return undefined;

    // Regex to match multiple of rate formats: 1b/h, 1 234.456e-5T/min, 0tT/s...
    const regexRate = /^\s*(?<num>[\d, ']*(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*(?<unit>[a-zA-Z]*)\/(?<time>h|min|m|s)\s*$/;
    const match = regexRate.exec(s);

    if (!match)
        throw new Error(`invalid literal for parseRateString(): '${s}'`);

    const { _, num, unit, time } = match.groups;

    let ret: number = parseFloat(num.replace(/[^\d.]/, ''));

    let idx = units.indexOf(unit);
    if (idx < 0)
        throw new Error(`invalid unit: '${unit}'`);

    ret *= Math.pow(10, 3*idx);

    if (time == "h") {
        ret /= 3600;
    } else if (time == "m" || time == "min") {
        ret /= 60;
    } else {
    }
    return ret;
}

/**
 * Format into a human-friendly string a rate (given in /s)
 */
export function formatRateString(r: number, timeUnit: string = 'h'): string {

    let prefix;
    switch (timeUnit) {
        case 's':
            prefix = '/s';
            break;
        case 'm':
            r *= 60;
            prefix = '/min';
            break;
        case 'h':
            r *= 3600;
            prefix = '/h';
            break;
        default:
            throw new Error(`invalid unit: '${timeUnit}'`);
    }

    let unit;
    for (unit of units) {
        if (r < 1e3)
            break;
        r /= 1e3;
    }

    return r.toLocaleString() + unit + prefix;
}


/**
 * Round float calculations in a controlled manner
 * If two sets have the same bonuses but compounded in a different order, it can result in a slightly different
 * final bonus. One set will then be prioritary over the other, ignoring a preference order that should apply for
 * equal bonuses
 * To mitigate that, I round to 9 digits
 */
export function round(x, precision = 1e9) {
    return Math.round(x*precision)/precision;
}


/**
 * Extracts the Pareto frontier from a list of (x, y, element) tuples.
 * The frontier consists of non-dominated points.
 * Returns an array of groups, where each group contains elements with the same (x, y) values.
 *
 * Complexity in O(n*log(n)) where n is list.length
 */

export function extractParetoFrontier<T>(list: [number, number, T][]): T[][] {
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
        groups.get(key)[3].push(element);
    }
    const elements = Array.from(groups.values())
    return elements.filter(([x,y,z]) =>
        !elements.some(([u,v,w]) => x <= u && y <= v && z <= w && (x < u || y < v || z < w)))
        .map(([, , , elements]) => elements);
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
export function* product(...arrays: any[][]): Generator<any[], void, void> {
    function* aux(index: number, current: any[]): Generator<any[], void, void> {
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




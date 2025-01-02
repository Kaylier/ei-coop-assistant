
const units: string[] = [
    '',
    'K', 'M' , 'B' , 'T' , 'q' , 'Q' , 's' , 'S' , 'o' , 'N',
    'd', 'U' , 'D' , 'Td', 'qd', 'Qd', 'sd', 'Sd', 'Od', 'Nd',
    'V', 'uV', 'dV', 'tV', 'qV', 'QV', 'sV', 'SV', 'OV', 'NV',
    'tT'
];


export function checkEID(eid) {
    return /^\s*EI[0-9]{16}\s*$/.test(eid);
}


// Regex to match multiple of rate formats: 1b/h, 1 234.456e-5T/min, 0tT/s...
const regexRate = /^\s*(?<num>[\d, ']*(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*(?<unit>[a-zA-Z]*)\/(?<time>h|min|m|s)\s*$/;

export function checkRateString(s: string, allowEmpty: boolean = true): boolean {
    return (allowEmpty && s === "") || regexRate.test(s);
}

/**
 * Parse a string of the form 1.234q/h and return a rate per seconds as a number
 */
export function parseRateString(s: string): number {
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
 * Returns a sublist of minmaxed elements.
 * An element is considered minmaxed if for every other element in the sorted array,
 * it has a lower value for either key0 or key1.
 * On equalities on both keys, the order is preserved.
 * @param list The array of objects to be sorted and filtered.
 * @param key0 The first key to sort by.
 * @param key1 The second key to sort by.
 * @param strict If false, return intermediate elements as well (equal to a minmaxed on key0 or key1)
 * @returns A sublist of objects containing only minmaxed elements.
 */
export function minmaxReduce(list: any[], key0: string, key1: string, strict: boolean = true) {
    // Create a map to store each element's original index
    const indexMap = new Map(list.map((element, index) => [element, index]));

    // Primary sorting by key0 in decreasing order
    // Secondary sorting by key1 in increasing for non-strict mode, decreasing order for strict mode
    // Tertiary sorting by original index to keep the sort stable
    list.sort((a, b) => {
        return (
            b[key0] - a[key0] ||
            (strict ? b[key1] - a[key1] : a[key1] - b[key1]) ||
            (indexMap.get(a) - indexMap.get(b))
        );
    });

    const result: any[] = [];
    let bestKey1 = -Infinity;

    for (const element of list) {
        if (element[key1] > bestKey1 || (!strict && element[key1] === bestKey1)) {
            result.push(element);
            bestKey1 = element[key1];
        }
    }

    return result;
}


/**
 * Generates all combinations of a given size from the provided array.
 *
 * Example: combinations(['a', 'b', 'c', 'd'], 3) will yield
 *          ['a', 'b', 'c'], ['a', 'b', 'd'], ['a', 'c', 'd'] and ['b', 'c', 'd']
 *
 * @param array The input array from which to generate permutations.
 * @param size The size of each permutation.
 * @returns A generator yielding arrays of elements from the original array.
 */
export function* combinations<T>(array: T[], size: number): Generator<T[], void, void> {
    function* aux(tempArray: T[], startIndex: number): Generator<T[], void, void> {
        if (tempArray.length === size) {
            yield [...tempArray];
            return;
        }

        for (let i = startIndex; i < array.length; i++) {
            tempArray.push(array[i]);
            yield* aux(tempArray, i + 1);
            tempArray.pop();
        }
    }

    yield* aux([], 0);
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




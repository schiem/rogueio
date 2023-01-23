/**
 * Get a random number between floor (inclusive) and ceil (exclusive)
 */
export const random = (floor: number, ceil: number): number => {
    return Math.floor(Math.random() * (ceil - floor) + floor);
}

export const randomList = <T>(list: ArrayLike<T>): T => {
    return list[random(0, list.length)];
}

export const randomEnum = <T>(type: { [s: string]: T | string; }): T => {
    return randomList(Object.values(type).filter(x => typeof x === 'number')) as T;
}

export const clamp = (num: number, min?: number, max?: number): number => {
    if (min !== undefined) {
        num = Math.max(num, min);
    }

    if (max !== undefined) {
        num = Math.min(num, max);
    }

    return num;
}

export const random = (floor: number, ceil: number): number => {
    return Math.floor(Math.random() * (ceil - floor) + floor);
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
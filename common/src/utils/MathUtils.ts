export const random = (floor: number, ceil: number): number => {
    return Math.floor(Math.random() * (ceil - floor) + floor);
}
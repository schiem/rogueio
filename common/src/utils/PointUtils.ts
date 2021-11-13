import { Point } from "../types/Points"

export const pointDistanceSquared = (first: Point, second: Point): number => {
    const xDiff = first.x - second.x;
    const yDiff = first.y - second.y;
    return xDiff * xDiff + yDiff * yDiff;
}

export const pointDistance = (first: Point, second: Point): number => {
    return Math.sqrt(pointDistanceSquared(first, second));
}
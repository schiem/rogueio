export type Point = {x: number, y: number};

export const pointsAreEqual = (point: Point, otherPoint: Point): boolean => {
    return point.x === otherPoint.x && point.y === otherPoint.y;
}

export const pointDistanceSquared = (point: Point, otherPoint: Point): number => {
    return Math.pow(point.x - otherPoint.x, 2) + Math.pow(point.y - otherPoint.y, 2);
}

export const pointDistance = (point: Point, otherPoint: Point): number => {
    return Math.sqrt(pointDistanceSquared(point, otherPoint));
}

export const addPoints = (point: Point, otherPoint: Point): Point => {
    return { x: point.x + otherPoint.x, y: point.y + otherPoint.y };
}

export const normalizePoint = (point: Point): Point => {
    return { x: point.x / Math.abs(point.x), y: point.y / Math.abs(point.y) };
}

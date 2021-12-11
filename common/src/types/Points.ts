export type Point = {x: number, y: number};

export const pointsAreEqual = (point: Point, otherPoint: Point): boolean => {
    return point.x === otherPoint.x && point.y === otherPoint.y;
}
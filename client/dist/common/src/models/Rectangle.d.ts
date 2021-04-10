import { Point } from "../types/Points";
export declare class Rectangle {
    location: Point;
    size: Point;
    get topLeft(): Point;
    get bottomRight(): Point;
    get center(): Point;
    get id(): string;
    constructor(location: Point, size: Point);
    overlapsWith(other: Rectangle): boolean;
    contains(point: Point): boolean;
    distanceToCenter(other: Rectangle): number;
    distanceTo(other: Rectangle): number;
    distanceToPoint(point: Point): number;
    distanceToCenterSquared(other: Rectangle): number;
    distanceToSquared(other: Rectangle): number;
    distanceToPointSquared(point: Point): number;
}

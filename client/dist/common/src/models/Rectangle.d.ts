import { Point } from "../types/Points";
export declare class Rectangle {
    location: Point;
    size: Point;
    topLeft: Point;
    bottomRight: Point;
    constructor(location: Point, size: Point);
    overlapsWith(other: Rectangle): boolean;
}

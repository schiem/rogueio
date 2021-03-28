import { Point } from "../types/Points";
export declare class Rectangle {
    location: Point;
    size: Point;
    get topLeft(): Point;
    get bottomRight(): Point;
    constructor(location: Point, size: Point);
    overlapsWith(other: Rectangle): boolean;
}

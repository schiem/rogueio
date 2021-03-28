import { Point } from "../types/Points";

export class Rectangle {
    location: Point;
    size: Point;

    get topLeft(): Point { return this.location };
    get bottomRight(): Point { return {x: this.location.x + this.size.x, y: this.location.y + this.size.y }};

    constructor(location: Point, size: Point) {
        this.location = location;
        this.size = size;
    }

    overlapsWith(other: Rectangle): boolean {
        return !(this.bottomRight.x <= other.topLeft.x || this.topLeft.x >= other.bottomRight.x ||
        this.bottomRight.y <= other.topLeft.y || this.topLeft.y >= other.bottomRight.y) 
    }
}
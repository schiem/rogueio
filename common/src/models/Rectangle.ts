import { Point } from "../types/Points";

export class Rectangle {
    location: Point;
    size: Point;

    topLeft: Point;
    bottomRight: Point;

    constructor(location: Point, size: Point) {
        this.location = location;
        this.size = size;

        this.topLeft = location;
        this.bottomRight = {x: location.x + size.x, y: location.y + size.y};
    }

    overlapsWith(other: Rectangle): boolean {
        return !(this.bottomRight.x <= other.topLeft.x || this.topLeft.x >= other.bottomRight.x ||
        this.bottomRight.y <= other.topLeft.y || this.topLeft.y >= other.bottomRight.y) 
    }
}
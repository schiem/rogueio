import { Point } from "../types/Points";

export class Rectangle {
    location: Point;
    size: Point;

    get topLeft(): Point { return this.location };
    get bottomRight(): Point { return {x: this.location.x + this.size.x, y: this.location.y + this.size.y }};
    get center(): Point { return {x: this.location.x + Math.floor(this.size.x / 2), y: this.location.y + Math.floor(this.size.y / 2)}};
    get id(): string { return `${this.location.x}x${this.location.y}x${this.size.x}x${this.size.y}` };

    constructor(location: Point, size: Point) {
        this.location = location;
        this.size = size;
    }

    overlapsWith(other: Rectangle): boolean {
        return !(this.bottomRight.x <= other.topLeft.x || this.topLeft.x >= other.bottomRight.x ||
        this.bottomRight.y <= other.topLeft.y || this.topLeft.y >= other.bottomRight.y) 
    }
    
    contains(point: Point): boolean {
        const bottomRight = this.bottomRight;
        return point.x >= this.location.x && point.x < bottomRight.x 
            && point.y >= this.location.y && point.y < bottomRight.y;
    }

    distanceToCenter(other: Rectangle): number {
        return Math.sqrt(this.distanceToCenter(other));
    }

    distanceTo(other: Rectangle): number {
        return Math.sqrt(this.distanceToSquared(other));
    }

    distanceToPoint(point: Point): number {
        return Math.sqrt(this.distanceToPointSquared(point));
    }

    distanceToCenterSquared(other: Rectangle): number {
        const center = this.center;
        const otherCenter = other.center;
        const xSquared = (center.x - otherCenter.x) * (center.x * otherCenter.x);
        const ySquared = (center.y - otherCenter.y) * (center.y * otherCenter.y);
        return xSquared + ySquared;
    }

    distanceToSquared(other: Rectangle): number {
        const bottomRight = this.bottomRight;
        const otherBr = other.bottomRight;
        let xDiff = 0;
        if(bottomRight.x < other.location.x) {
            xDiff = other.location.x - bottomRight.x;
        } else if(otherBr.x < this.location.x) {
            xDiff = this.location.x - otherBr.x;
        }

        let yDiff = 0;
        if(bottomRight.y < other.location.y) {
            yDiff = other.location.y - bottomRight.y;
        } else if(otherBr.y < this.location.y) {
            yDiff = this.location.y - otherBr.y;
        }

        return (xDiff * xDiff) + (yDiff * yDiff);
    }

    distanceToPointSquared(point: Point): number {
        const bottomRight = this.bottomRight;
        let xDiff = 0;
        if(point.x < this.location.x || point.x > bottomRight.x) {
            xDiff = this.location.x - point.x;
        }

        let yDiff = 0;
        if(point.y < this.location.y || point.y > bottomRight.y) {
            yDiff = this.location.y - point.y;
        }

        return (xDiff * xDiff) + (yDiff * yDiff);
    }
}
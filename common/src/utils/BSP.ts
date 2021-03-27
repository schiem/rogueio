import { Point } from "../types/Points";
import { Rectangle } from "../models/Rectangle";

export class RandomBSP {
    children: RandomBSP[] = [];
    rect: Rectangle;

    constructor(
    coords: Point, 
    size: Point) {
        this.rect =  new Rectangle(coords, size);
    }

    // returns true if it has at least one terminal leaf
    split(minSize: number, maxSize: number): boolean {
        // this rectangle can contain a room - don't try to split it
        if(this.rect.size.x <= maxSize && this.rect.size.x >= minSize &&
            this.rect.size.y <= maxSize && this.rect.size.y >= minSize) {
            return true;
        }

        // decide which direction to split
        let splitCoords: Point = {x: 0, y : 0};
        let splitSize: Point;
        const otherCoords: Point = this.rect.location;
        let otherSize: Point;
        if(this.rect.size.x > this.rect.size.y * 1.5) {
            splitCoords.y = this.rect.location.y;
            const xOffset = this.getSplitPoint(this.rect.size.x, minSize);
            splitCoords.x = xOffset + this.rect.location.x;
            splitSize = {x: this.rect.size.x - xOffset, y: this.rect.size.y};
            otherSize = {x: this.rect.size.x - splitSize.x, y: this.rect.size.y}
        } else {
            splitCoords.x = this.rect.location.x;
            const yOffset = this.getSplitPoint(this.rect.size.y, minSize);
            splitCoords.y = yOffset + this.rect.location.y;
            splitSize = {x: this.rect.size.x, y: this.rect.size.y - yOffset};
            otherSize = {x: this.rect.size.x, y: this.rect.size.y - splitSize.y}
        }

        let children: RandomBSP[] = [];
        if(splitSize.x > minSize && splitSize.y > minSize) {
            children.push(new RandomBSP(splitCoords, splitSize));
        }

        if(otherSize.x > minSize && otherSize.y > minSize) {
            children.push(new RandomBSP(otherCoords, otherSize));
        }

        let hasChild: boolean = false;
        if(children.length) {
            children.forEach(child => {
                if(child.split(minSize, maxSize)) {
                    this.children.push(child);
                    hasChild = true;
                }
            });
        }
        return hasChild;
    }

    getChildRectangles(): Rectangle[] {
        if(this.children.length === 0) {
            return [this.rect];
        }
        let rectangles: Rectangle[] = [];
        this.children.forEach((child) => {
            rectangles.push(...child.getChildRectangles());
        });
        return rectangles;
    }

    getSplitPoint(size: number, minSize: number): number {
        let floor: number;
        let ceil: number;
        const halfSize = size / 2;
        if(size > minSize * 2) {
            //we have a space larger than double the minimum size, split close to the center
            floor = Math.floor(halfSize - (minSize / 2));
            ceil = Math.ceil(halfSize + (minSize / 2));
        } else {
            //we only have enough space to fit one room in here, allow it to split closer to the sides
            floor = Math.floor(minSize / 2);
            ceil = Math.ceil(size - minSize / 2);
        }
        const range = ceil - floor;
        return Math.floor(Math.random() * range) + floor;
    }
}
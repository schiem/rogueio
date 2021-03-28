import { Point } from "../types/Points";
import { Rectangle } from "../models/Rectangle";
import { random } from "./MathUtils";

export class RandomBSP {
    children: RandomBSP[] = [];
    rect: Rectangle;
    isLeaf: boolean = false;

    constructor(
    coords: Point, 
    size: Point) {
        this.rect =  new Rectangle(coords, size);
    }

    // removes leaves by a function
    prune(pruneFN: (bsp: RandomBSP) => boolean): void {
        const toRemove: RandomBSP[] = [];
        this.children.forEach((child) => {
            child.prune(pruneFN);
            if(pruneFN(child) || (!child.isLeaf && child.children.length === 0)) {
                toRemove.push(child);
            }
        });

        if(toRemove.length === this.children.length) {
            this.children = [];
        } else {
            this.children = this.children.filter((child) => !toRemove.includes(child));
        }
    }

    transform(transformFN: (bsp: RandomBSP) => void): void {
        if (this.isLeaf) {
            transformFN(this);
        } else {
            this.children.forEach((child) => {
                child.transform(transformFN);
            });
        }
    }

    // returns true if it has at least one terminal leaf
    split(minSize: Point, maxSize: Point): boolean {
        // this rectangle can contain a room - don't try to split it
        if(this.rect.size.x <= maxSize.x && this.rect.size.x >= minSize.x &&
            this.rect.size.y <= maxSize.y && this.rect.size.y >= minSize.y) {
            this.isLeaf = true;
            return true;
        }

        // decide which direction to split
        let splitCoords: Point = {x: 0, y : 0};
        let splitSize: Point;
        const otherCoords: Point = this.rect.location;
        let otherSize: Point;

        //our particular tiles are larger in the y than the x, so add a factor to get "squarer" looking rooms
        if(this.rect.size.x > (this.rect.size.y * (maxSize.x / maxSize.y))) {
            splitCoords.y = this.rect.location.y;
            const xOffset = this.getSplitPoint(this.rect.size.x, minSize.x);
            splitCoords.x = xOffset + this.rect.location.x;
            splitSize = {x: this.rect.size.x - xOffset, y: this.rect.size.y};
            otherSize = {x: this.rect.size.x - splitSize.x, y: this.rect.size.y}
        } else {
            splitCoords.x = this.rect.location.x;
            const yOffset = this.getSplitPoint(this.rect.size.y, minSize.y);
            splitCoords.y = yOffset + this.rect.location.y;
            splitSize = {x: this.rect.size.x, y: this.rect.size.y - yOffset};
            otherSize = {x: this.rect.size.x, y: this.rect.size.y - splitSize.y}
        }

        let children: RandomBSP[] = [];
        if(splitSize.x > minSize.x && splitSize.y > minSize.y) {
            children.push(new RandomBSP(splitCoords, splitSize));
        }

        if(otherSize.x > minSize.x && otherSize.y > minSize.y) {
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
        return random(floor, ceil);
    }
}
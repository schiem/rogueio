import { Point } from "../types/Points";
import { Rectangle } from "../models/Rectangle";

type DataPoint = {point: Point, data: any};
export class QuadTree {
    private children: QuadTree[] | DataPoint[] = new Array(4);
    private rect: Rectangle;
    private uniqueId: string;
    private quadNames: Record<string, number> = {
        topLeft: 0,
        topRight: 1,
        bottomLeft: 2,
        bottomRight: 3
    };

    constructor(rect: Rectangle, private parent?: QuadTree) {
        this.rect = new Rectangle(rect.location, {
            x: rect.size.x > rect.size.y ? rect.size.x : rect.size.y,
            y: rect.size.x > rect.size.y ? rect.size.x : rect.size.y,
        });
        if(this.rect.size.x > this.rect.size.y) {
            this.rect.size.y = this.rect.size.x;
        } else if(this.rect.size.y > this.rect.size.x) {
            this.rect.size.x = this.rect.size.y;
        }
        const center = this.rect.center;
        this.uniqueId = `${center.x}x${center.y}`;
    }

    addRectangle(rect: Rectangle, data: any) {
        this.add(rect.location, data);
        this.add({
            x: rect.location.x + rect.size.x,
            y: rect.location.y}, data);
        this.add({
            x: rect.location.x,
            y: rect.location.y + rect.size.y}, data);
        this.add({
            x: rect.location.x + rect.size.x,
            y: rect.location.y + rect.size.y}, data);
    }

    add(coords: Point, data: any): boolean {
        const quadIndex = this.getIndexForCoords(coords);
        if(quadIndex === undefined) {
            return false;
        }

        //use the smaller one because a naughty naughty boi didn't make their quad square
        const halfSize = this.getHalfSize();
        //console.log(halfSize);
        const center = this.rect.center;

        //figure out which quadrant this goes in
        const quadrant = this.children[quadIndex];

        if(quadrant === undefined) {
            if (halfSize <= 1) {
                // create a new point
                this.children[quadIndex] = {point: coords, data};
                return true;
            } else {
                // add a new quad
                const newX = quadIndex === this.quadNames.topLeft || quadIndex === this.quadNames.bottomLeft ? this.rect.location.x : center.x;
                const newY = quadIndex === this.quadNames.topLeft || quadIndex === this.quadNames.topRight ? this.rect.location.y : center.y;
                const newQuad = new QuadTree(new Rectangle({x: newX, y: newY}, {x: halfSize, y: halfSize}), this);
                this.children[quadIndex] = newQuad;
                return newQuad.add(coords, data);
            }
        } else if(halfSize > 1) {
            // already have a child here, and it's not a Point
            return (quadrant as QuadTree).add(coords, data);
        }
        //already have data in this spot
        return false;
    }

    findClosest(coords: Point): QuadTree | DataPoint | undefined {
        const quadIndex = this.getIndexForCoords(coords);
        if(quadIndex === undefined) {
            return;
        }

        if(this.children[quadIndex] === undefined) {
            return this;
        }
        if(this.getHalfSize() <= 1) {
            return this.children[quadIndex];
        }

        return (this.children[quadIndex] as QuadTree).findClosest(coords);
    }

    get(coords: Point): any | undefined {
        const quadIndex = this.getIndexForCoords(coords);
        if(quadIndex === undefined || this.children[quadIndex] === undefined) {
            return;
        }

        if (!(this.children[quadIndex] instanceof QuadTree)) {
            return this.children[quadIndex];
        }
        return (this.children[quadIndex] as QuadTree).get(coords);
    }

    closest(coords: Point): DataPoint | undefined {
        // find the small rectangle containing the point
        const closest = this.findClosest(coords);
        const best: {point: DataPoint | undefined, distanceSquared: number} =  { point: undefined, distanceSquared: Infinity};
        const checked: Record<string, boolean> = {};

        // we're looking at a point, not a quad
        if(!(closest instanceof QuadTree)) {
            return closest;
        }
        closest.recurseClosest(coords, checked, best);
        return best.point;
    }

    recurseClosest(coords: Point, checked: Record<string, boolean>, best: {point: DataPoint | undefined, distanceSquared: number}): void {
        const uniqueId = this.uniqueId;
        if(checked[uniqueId]) {
            //already checked this
            return;
        }
        checked[uniqueId] = true;
        if(this.rect.distanceToPointSquared(coords) > best.distanceSquared) {
            //nothing in this rectangle is better than one we've already found
            return;
        }

        this.children.forEach((child: QuadTree | DataPoint) => {
            if(child !== undefined) {
                if(child instanceof QuadTree) {
                    (child as QuadTree).recurseClosest(coords, checked, best);
                } else {
                    const pointChild = child as DataPoint;
                    const xDiff = (pointChild.point.x - coords.x);
                    const yDiff = (pointChild.point.y - coords.y);
                    const distSquared = (xDiff * xDiff) + (yDiff * yDiff);
                    if(distSquared < best.distanceSquared) {
                        best.distanceSquared = distSquared;
                        best.point = pointChild;
                    }
                }
            }
        });

        if(this.parent !== undefined) {
            this.parent.recurseClosest(coords, checked, best);
        }
    }

    private getHalfSize() {
        return this.rect.size.x > this.rect.size.y ? this.rect.size.y / 2 : this.rect.size.x / 2;
    }

    private getIndexForCoords(coords: Point): number | undefined {
        if(!this.rect.contains(coords)) {
            return;
        }
        const center = this.rect.center;
        if(coords.x < center.x) {
            if(coords.y < center.y) {
                return this.quadNames.topLeft;
            } else {
                return this.quadNames.bottomLeft;
            }
        } else {
            if(coords.y < center.y) {
                return this.quadNames.topRight;
            } else {
                return this.quadNames.bottomRight;
            }
        }
    }
}
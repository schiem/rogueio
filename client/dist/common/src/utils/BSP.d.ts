import { Point } from "../types/Points";
import { Rectangle } from "../models/Rectangle";
export declare class RandomBSP {
    children: RandomBSP[];
    rect: Rectangle;
    constructor(coords: Point, size: Point);
    split(minSize: number, maxSize: number): boolean;
    getChildRectangles(): Rectangle[];
    getSplitPoint(size: number, minSize: number): number;
}

import { Point } from "../../../common/src/types/Points";
import { SpriteSheet } from "./SpriteSheet";
export declare class ViewPort {
    size: Point;
    spriteSheet: SpriteSheet;
    canvas: HTMLCanvasElement;
    offset: Point;
    ctx: CanvasRenderingContext2D;
    constructor(size: Point, spriteSheet: SpriteSheet, canvas: HTMLCanvasElement);
}

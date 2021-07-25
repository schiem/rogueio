import { Point } from "../../../common/src/types/Points";
import { SpriteSheet } from "./SpriteSheet";
export declare class ViewPort {
    size: Point;
    canvas: HTMLCanvasElement;
    spriteSheet: SpriteSheet;
    offset: Point;
    ctx: CanvasRenderingContext2D;
    constructor(size: Point, canvas: HTMLCanvasElement, spriteSheet: SpriteSheet);
    renderFrom(canvas: HTMLCanvasElement): void;
}

import { Point } from "../../../common/src/types/Points";
import { SpriteSheet } from "./SpriteSheet";

export class ViewPort {
    offset: Point;
    ctx: CanvasRenderingContext2D;

    constructor(
        public size: Point,
        public spriteSheet: SpriteSheet,
        public canvas: HTMLCanvasElement
    ) {
        this.offset = {x: 0, y: 0};
        this.canvas.width = spriteSheet.spriteWidth * this.size.x;
        this.canvas.height = spriteSheet.spriteHeight * this.size.y;
        this.ctx = this.canvas.getContext('2d', {alpha: false}) as CanvasRenderingContext2D;
    }
}
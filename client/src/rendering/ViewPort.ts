import { Point } from "../../../common/src/types/Points";
import { SpriteSheet } from "./SpriteSheet";

export class ViewPort {
    offset: Point;
    ctx: CanvasRenderingContext2D;

    constructor(
        public size: Point,
        public canvas: HTMLCanvasElement,
        public spriteSheet: SpriteSheet
    ) {
        this.offset = {x: 0, y: 0};
        this.canvas.width = this.spriteSheet.spriteSize.x * this.size.x;
        this.canvas.height = this.spriteSheet.spriteSize.y * this.size.y;
        this.ctx = this.canvas.getContext('2d', {alpha: false}) as CanvasRenderingContext2D;
    }

    renderFrom(canvas: HTMLCanvasElement) {
        requestAnimationFrame(() => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(
                canvas, 
                this.offset.x * this.spriteSheet.spriteSize.x, 
                this.offset.y * this.spriteSheet.spriteSize.y, 
                this.canvas.width, 
                this.canvas.height, 
                0, 
                0,
                this.canvas.width,
                this.canvas.height);
        });
    }
}
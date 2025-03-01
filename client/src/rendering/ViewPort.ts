import { Point } from "../../../common/src/types/Points";
import { SpriteSheet } from "./SpriteSheet";

export class ViewPort {
    offset: Point;
    ctx: CanvasRenderingContext2D;
    requesting: boolean = false;

    constructor(
        public size: Point,
        public canvas: HTMLCanvasElement,
        public spriteSheet: SpriteSheet,
        public backgroundColor: string
    ) {
        this.offset = {x: 0, y: 0};
        this.canvas.width = this.spriteSheet.spriteSize.x * this.size.x;
        this.canvas.height = this.spriteSheet.spriteSize.y * this.size.y;
        this.ctx = this.canvas.getContext('2d', {alpha: false}) as CanvasRenderingContext2D;
    }

    convertToWorld(location: Point): Point {
        return {x: location.x + this.offset.x, y: location.y + this.offset.y };
    }

    renderFrom(canvas: HTMLCanvasElement) {
        // Multiple requests may come in before the paint actually happens
        // If there is already a pending paint request, ignore it.
        if (this.requesting) {
            return;
        }

        this.requesting = true;
        requestAnimationFrame(() => {
            this.requesting = false;
            this.ctx.fillStyle = this.backgroundColor;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
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
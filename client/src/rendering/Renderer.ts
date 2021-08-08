import { Rectangle } from "../../../common/src/models/Rectangle";
import { Point } from "../../../common/src/types/Points";
import { clamp } from "../../../common/src/utils/MathUtils";
import { SpriteSheet } from "./SpriteSheet";
import { ViewPort } from "./ViewPort";

export class Renderer {
    private ctx: CanvasRenderingContext2D;

    // takes the canvas to render to
    constructor(
        public canvas: HTMLCanvasElement, 
        public spriteSheet: SpriteSheet,
        private viewPort: ViewPort) {
            this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    }

    drawRectangle(sprite: string, rect: Rectangle, fill: boolean = false) {
        if(fill) {
            for(let x = rect.topLeft.x; x <= rect.bottomRight.x; x++) {
                for(let y = rect.topLeft.y; y <= rect.bottomRight.y; y++) {
                    this.drawSprite(sprite, {x, y});
                }
            }
        } else {
            [rect.topLeft.y, rect.bottomRight.y].forEach((y) => {
                for(let x = rect.topLeft.x; x <= rect.bottomRight.x; x++) {
                    this.drawSprite(sprite, {x, y});
                }
            });

            [rect.topLeft.x, rect.bottomRight.x].forEach((x) => {
                for(let y = rect.topLeft.y + 1; y < rect.bottomRight.y; y++) {
                    this.drawSprite(sprite, {x, y});
                }
            });
        }
    }

    drawSprite(sprite: string, location: Point): void {
        const spriteNum = this.spriteSheet.spriteNames[sprite];
        if(!this.spriteSheet.ready || spriteNum > this.spriteSheet.numSprites) {
            throw new Error('Could not draw the sprite, either they have not been loaded or the sprite does not exist.')
        }
        const x = location.x *  this.spriteSheet.spriteSize.x;
        const y = location.y * this.spriteSheet.spriteSize.y;
        this.ctx.clearRect(x, y, this.spriteSheet.spriteSize.x, this.spriteSheet.spriteSize.y);
        this.ctx.drawImage(
            this.spriteSheet.sheetElement, 
            this.spriteSheet.spriteSize.x * spriteNum, 
            0, 
            this.spriteSheet.spriteSize.x, 
            this.spriteSheet.spriteSize.y, 
            x, 
            y, 
            this.spriteSheet.spriteSize.x, 
            this.spriteSheet.spriteSize.y);
    }

    clearSquare(location: Point): void {
        this.ctx.clearRect(location.x * this.spriteSheet.spriteSize.x, location.y * this.spriteSheet.spriteSize.y, this.spriteSheet.spriteSize.x, this.spriteSheet.spriteSize.y);
    }

    centerViewPortOn(location: Point) : void {
        // get the virtual canvas size
        const maxSize: Point = {
            x: this.canvas.width / this.spriteSheet.spriteSize.x,
            y: this.canvas.height / this.spriteSheet.spriteSize.y
        };


        let center: Point = {
            x: location.x - (this.viewPort.size.x / 2),
            y: location.y - (this.viewPort.size.y / 2)
        };

        center.x = clamp(center.x, 0, maxSize.x - this.viewPort.size.x);
        center.y = clamp(center.y, 0, maxSize.y - this.viewPort.size.y);

        this.viewPort.offset = center;
    }

    renderViewPort(): void {
        this.viewPort.renderFrom(this.canvas);
    }
}
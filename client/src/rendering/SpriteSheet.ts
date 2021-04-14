import { Point } from "../../../common/src/types/Points";
import { Rectangle } from "../../../common/src/models/Rectangle";

export class SpriteSheet {
    sheetElement: HTMLImageElement;
    numSprites: number = 0;
    ready = false;
    onReadyFunctions: (() => void)[] = [];

    constructor(
        public spriteWidth: number,
        public spriteHeight: number,
        public spriteSheetSrc: string,
        public spriteNames: Record<string, number>
    ) {
        this.sheetElement = new Image();
        this.sheetElement.src = spriteSheetSrc;
        this.sheetElement.onload = () => {
            this.ready = true;
            this.numSprites = this.sheetElement.width / this.spriteWidth;
            this.onReadyFunctions.forEach(func => {
                func();
            });
        }
    }

    onReady(func: () => void) {
        if(this.ready) {
            func();
        } else {
            this.onReadyFunctions.push(func);
        }
    }

    drawRectangle(sprite: string, rect: Rectangle, ctx: CanvasRenderingContext2D, fill: boolean = false) {
        if(fill) {
            for(let x = rect.topLeft.x; x <= rect.bottomRight.x; x++) {
                for(let y = rect.topLeft.y; y <= rect.bottomRight.y; y++) {
                    this.drawSprite(sprite, {x, y}, ctx);
                }
            }
        } else {
            [rect.topLeft.y, rect.bottomRight.y].forEach((y) => {
                for(let x = rect.topLeft.x; x <= rect.bottomRight.x; x++) {
                    this.drawSprite(sprite, {x, y}, ctx);
                }
            });

            [rect.topLeft.x, rect.bottomRight.x].forEach((x) => {
                for(let y = rect.topLeft.y + 1; y < rect.bottomRight.y; y++) {
                    this.drawSprite(sprite, {x, y}, ctx);
                }
            });
        }
    }

    drawSprite(sprite: string, location: Point, ctx: CanvasRenderingContext2D): void {
        const spriteNum = this.spriteNames[sprite];
        if(!this.ready || spriteNum > this.numSprites) {
            throw new Error('Could not draw the sprite, either they have not been loaded or the sprite does not exist.')
        }
        const x = location.x *  this.spriteWidth;
        const y = location.y * this.spriteHeight;
        ctx.clearRect(x, y, this.spriteWidth, this.spriteHeight);
        ctx.drawImage(this.sheetElement, this.spriteWidth * spriteNum, 0, this.spriteWidth, this.spriteHeight, x, y, this.spriteWidth, this.spriteHeight);
    }
}

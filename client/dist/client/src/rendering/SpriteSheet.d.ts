import { Point } from "../../../common/src/types/Points";
import { Rectangle } from "../../../common/src/models/Rectangle";
export declare class SpriteSheet {
    spriteWidth: number;
    spriteHeight: number;
    spriteSheetSrc: string;
    sheetElement: HTMLImageElement;
    numSprites: number;
    ready: boolean;
    onReadyFunctions: (() => void)[];
    constructor(spriteWidth: number, spriteHeight: number, spriteSheetSrc: string);
    onReady(func: () => void): void;
    drawRectangle(sprite: number, rect: Rectangle, ctx: CanvasRenderingContext2D, fill?: boolean): void;
    drawSprite(sprite: number, location: Point, ctx: CanvasRenderingContext2D): void;
}

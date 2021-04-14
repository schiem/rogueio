import { Point } from "../../../common/src/types/Points";
import { Rectangle } from "../../../common/src/models/Rectangle";
export declare class SpriteSheet {
    spriteWidth: number;
    spriteHeight: number;
    spriteSheetSrc: string;
    spriteNames: Record<string, number>;
    sheetElement: HTMLImageElement;
    numSprites: number;
    ready: boolean;
    onReadyFunctions: (() => void)[];
    constructor(spriteWidth: number, spriteHeight: number, spriteSheetSrc: string, spriteNames: Record<string, number>);
    onReady(func: () => void): void;
    drawRectangle(sprite: string, rect: Rectangle, ctx: CanvasRenderingContext2D, fill?: boolean): void;
    drawSprite(sprite: string, location: Point, ctx: CanvasRenderingContext2D): void;
}

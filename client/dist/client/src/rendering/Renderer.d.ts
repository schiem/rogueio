import { Rectangle } from "../../../common/src/models/Rectangle";
import { Point } from "../../../common/src/types/Points";
import { SpriteSheet } from "./SpriteSheet";
import { ViewPort } from "./ViewPort";
export declare class Renderer {
    canvas: HTMLCanvasElement;
    spriteSheet: SpriteSheet;
    private viewPort;
    private ctx;
    constructor(canvas: HTMLCanvasElement, spriteSheet: SpriteSheet, viewPort: ViewPort);
    drawRectangle(sprite: string, rect: Rectangle, fill?: boolean): void;
    drawSprite(sprite: string, location: Point): void;
    clearSquare(location: Point): void;
    centerViewPortOn(location: Point): void;
    renderViewPort(): void;
}

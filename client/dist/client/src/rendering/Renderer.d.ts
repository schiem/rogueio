import { SpriteSheet } from "./SpriteSheet";
import { ViewPort } from "./ViewPort";
export declare class Renderer {
    canvas: HTMLCanvasElement;
    spriteSheet: SpriteSheet;
    viewPort: ViewPort;
    constructor(canvas: HTMLCanvasElement, spriteSheet: SpriteSheet);
}

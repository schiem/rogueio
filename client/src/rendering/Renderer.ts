import { Point } from "../../../common/src/types/Points";
import { SpriteSheet } from "./SpriteSheet";
import { ViewPort } from "./ViewPort";

export class Renderer {
    viewPort: ViewPort;

    constructor(
        public canvas: HTMLCanvasElement, 
        public spriteSheet: SpriteSheet) {
            const viewportSize: Point = {x: 256 * spriteSheet.spriteWidth, y: 128 * spriteSheet.spriteHeight }
            this.viewPort = new ViewPort(viewportSize, canvas, spriteSheet);
    }
}
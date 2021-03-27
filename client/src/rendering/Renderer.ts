import { Game } from "../../../common/src/models/Game";
import { Point } from "../../../common/src/types/Points";
import { SpriteSheet } from "./SpriteSheet";
import { ViewPort } from "./ViewPort";

export class Renderer {
    viewPort: ViewPort;

    constructor(
        public canvas: HTMLCanvasElement, 
        public game: Game, 
        public spriteSheet: SpriteSheet) {
            const viewportSize: Point = {x: game.dungeonX * spriteSheet.spriteWidth, y: game.dungeonY * spriteSheet.spriteHeight }
            this.viewPort = new ViewPort(viewportSize, spriteSheet, canvas);
    }
}
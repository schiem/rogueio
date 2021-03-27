import { Game } from "../../../common/src/models/Game";
import { SpriteSheet } from "./SpriteSheet";
import { ViewPort } from "./ViewPort";
export declare class Renderer {
    canvas: HTMLCanvasElement;
    game: Game;
    spriteSheet: SpriteSheet;
    viewPort: ViewPort;
    constructor(canvas: HTMLCanvasElement, game: Game, spriteSheet: SpriteSheet);
}

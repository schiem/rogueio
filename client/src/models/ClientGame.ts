import { Game } from "../../../common/src/models/Game";
import { Player } from "../../../common/src/models/Player";
import { Dungeon } from "../../../common/src/models/Dungeon";
import { SpriteSheet } from "../rendering/SpriteSheet";
import { Point } from "../../../common/src/types/Points";
import { Renderer } from "../rendering/Renderer";
import { ViewPort } from "../rendering/ViewPort";

export class ClientGame extends Game {
    currentPlayerId: string;
    renderer: Renderer;

    constructor(
        canvas: HTMLCanvasElement,
        spriteSheet: SpriteSheet,
        viewPort: ViewPort
    ) {
        super();
        this.renderer = new Renderer(canvas, spriteSheet, viewPort);
    }

    renderDungeonTileAtLocation(point: Point): void {
        const dungeon = this.currentDungeon;
        // render characters on top
        let spriteName: string | undefined;
        if (dungeon.characters[point.x] && dungeon.characters[point.x][point.y]) {
            spriteName = dungeon.characters[point.x][point.y].spriteName;
        } else if (false) {
            // TODO - items render next
        } else if (dungeon.tiles[point.x][point.y]?.definition) {
            // draw the tile underneath
            spriteName = dungeon.tiles[point.x][point.y].definition?.spriteName;
        }

        if (!spriteName) {
            // nothing to render here clear the space
            this.renderer.clearSquare(point);
            return;
        }
        this.renderer.drawSprite(spriteName as string, point);
    }

    recenterViewPort(): void {
        const location = this.players[this.currentPlayerId]?.location;
        if (location) {
            this.renderer.centerViewPortOn(location);
        }
    }

    renderDungeon(dungeon: Dungeon): void {
        this.currentDungeon = dungeon;
        for(let x = 0; x < this.currentDungeon.tiles.length; x++) {
            for(let y = 0; y < this.currentDungeon.tiles[x].length; y++) {
                this.renderDungeonTileAtLocation({x, y});
            }
        }
        this.recenterViewPort();
        this.renderer.renderViewPort();
    }
}
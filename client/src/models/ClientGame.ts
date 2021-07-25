import { Game } from "../../../common/src/models/Game";
import { Player } from "../../../common/src/models/Player";
import { Dungeon } from "../../../common/src/models/Dungeon";
import { SpriteSheet } from "../rendering/SpriteSheet";

export class ClientGame extends Game {
    currentPlayerId: string;
    players: Player[] = [];
    private ctx: CanvasRenderingContext2D;

    constructor(
        canvas: HTMLCanvasElement,
        private spriteSheet: SpriteSheet
    ) {
        super();
        this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    }

    initDungeon(dungeon: Dungeon) {
        this.currentDungeon = dungeon;
        for(let x = 0; x < this.currentDungeon.tiles.length; x++) {
            for(let y = 0; y < this.currentDungeon.tiles[x].length; y++) {
                const tile = this.currentDungeon.tiles[x][y];
                if (tile.definition !== undefined) {
                    this.spriteSheet.drawSprite(tile.definition.spriteName, tile.coords, this.ctx);
                }
            }
        }
    }
}
import { ViewPort } from "./rendering/ViewPort";
import { SpriteSheet } from "./rendering/SpriteSheet";
import { DungeonGenerator } from "../../common/src/models/Dungeon";
import { sprites } from "./rendering/Sprites";

const canvas: HTMLCanvasElement = document.getElementById('viewport') as HTMLCanvasElement;
const spriteWidth = 14;
const spriteHeight = 25;
const maxRoomSize = {x: 30, y: 16};
const minRoomSize = {x: 8, y: 4};
const minRoomSpacing = 6;
const maxRoomSpacing = 14;
const spriteSheet = new SpriteSheet(spriteWidth, spriteHeight, '/dist/assets/img/fira_code_regular_14.png', sprites);
const viewport = new ViewPort({x: 256, y: 128}, spriteSheet, canvas);

spriteSheet.onReady(() => {
    const dungeonGen = new DungeonGenerator({x: 256, y: 128}, minRoomSize, maxRoomSize, minRoomSpacing, maxRoomSpacing, 500);
    const d = new Date();
    const dungeon = dungeonGen.generate();
    console.log((new Date()).getTime() - d.getTime());
    for(let x = 0; x < dungeon.tiles.length; x++) {
        for(let y = 0; y < dungeon.tiles[x].length; y++) {
            const tile = dungeon.tiles[x][y];
            if (tile.definition !== undefined) {
                spriteSheet.drawSprite(tile.definition.spriteName, tile.coords, viewport.ctx);
            }
        }
    }
    dungeon.rooms.forEach((room) => {
        //spriteSheet.drawRectangle('floor', room.rect, viewport.ctx, false);
    });
});

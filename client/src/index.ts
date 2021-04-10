import { ViewPort } from "./rendering/ViewPort";
import { SpriteSheet } from "./rendering/SpriteSheet";
import { random } from "../../common/src/utils/MathUtils";
import { QuadTree } from "../../common/src/utils/QuadTree";
import { Rectangle } from "../../common/src/models/Rectangle";
import { Dungeon, DungeonGenerator } from "../../common/src/models/Dungeon";
import { tileDefinitions } from "../../common/src/consts/TileDefinitions";

const canvas: HTMLCanvasElement = document.getElementById('viewport') as HTMLCanvasElement;
const spriteWidth = 14;
const spriteHeight = 25;
const maxRoomSize = {x: 30, y: 16};
const minRoomSize = {x: 8, y: 4};
const minRoomSpacing = 10;
const maxRoomSpacing = 20;
const spriteSheet = new SpriteSheet(spriteWidth, spriteHeight, '/dist/assets/img/fira_code_regular_14.png');
const viewport = new ViewPort({x: 256, y: 128}, spriteSheet, canvas);


spriteSheet.onReady(() => {
    const d = new Date();
    const dungeonGen = new DungeonGenerator({x: 256, y: 128}, minRoomSize, maxRoomSize, minRoomSpacing, maxRoomSpacing, 500);
    const dungeon = dungeonGen.generate();
    console.log((new Date()).getTime() - d.getTime());
    dungeon.rooms.forEach((room) => {
        spriteSheet.drawRectangle(3, room.rect, viewport.ctx, false);
    });
});

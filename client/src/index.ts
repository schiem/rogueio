import { ViewPort } from "./rendering/ViewPort";
import { SpriteSheet } from "./rendering/SpriteSheet";
import { sprites } from "./rendering/Sprites";

const canvas: HTMLCanvasElement = document.getElementById('viewport') as HTMLCanvasElement;
const spriteWidth = 14;
const spriteHeight = 25;
const spriteSheet = new SpriteSheet(spriteWidth, spriteHeight, '/dist/assets/img/fira_code_regular_14.png', sprites);
const viewport = new ViewPort({x: 256, y: 128}, spriteSheet, canvas);


spriteSheet.onReady(() => {
    const ws = new WebSocket('ws://localhost:8888');
    console.log(ws);
    ws.onmessage = (event) => {
        console.log('received event');
        const dungeon = JSON.parse(event.data);
        for(let x = 0; x < dungeon.tiles.length; x++) {
            for(let y = 0; y < dungeon.tiles[x].length; y++) {
                const tile = dungeon.tiles[x][y];
                if (tile.definition !== undefined) {
                    spriteSheet.drawSprite(tile.definition.spriteName, tile.coords, viewport.ctx);
                }
            }
        }
    };
    /*
    dungeon.rooms.forEach((room) => {
        spriteSheet.drawRectangle('floor', room.rect, viewport.ctx, false);
    });
    */
});

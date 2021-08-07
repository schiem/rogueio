import { ViewPort } from "./rendering/ViewPort";
import { SpriteSheet } from "./rendering/SpriteSheet";
import { sprites } from "./rendering/Sprites";
import { ClientGame } from "./models/ClientGame";
import { NetworkEventHandler } from "./events/NetworkEventHandler";

const viewportCanvas: HTMLCanvasElement = document.getElementById('viewport') as HTMLCanvasElement;
const spriteWidth = 14;
const spriteHeight = 25;
const virtualCanvas = document.createElement('canvas');
const spriteSheet = new SpriteSheet({ x: spriteWidth, y: spriteHeight }, '/dist/assets/img/fira_code_regular_14.png', sprites);
const viewport = new ViewPort({x: 64, y: 32}, viewportCanvas, spriteSheet);

const game = new ClientGame(virtualCanvas, spriteSheet, viewport);
virtualCanvas.width = spriteWidth * game.dungeonX;
virtualCanvas.height = spriteHeight * game.dungeonY;

spriteSheet.onReady(() => {
    const ws = new WebSocket('ws://localhost:8888');

    ws.onmessage = (eventJson) => {
        const event = JSON.parse(eventJson.data);
        NetworkEventHandler.handleEvent(game, event);
    };
});

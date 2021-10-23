import { ViewPort } from "./rendering/ViewPort";
import { SpriteSheet } from "./rendering/SpriteSheet";
import { SpriteColors, Sprites } from "./rendering/Sprites";
import { ClientGame } from "./models/ClientGame";
import { NetworkEventHandler } from "./events/NetworkEventHandler";
import { NetworkEvent } from "../../common/src/events/NetworkEvent";
import { SpriteColor } from "../../common/src/types/Sprite";
import { decode } from "messagepack";

const viewportCanvas: HTMLCanvasElement = document.getElementById('viewport') as HTMLCanvasElement;
const spriteWidth = 14;
const spriteHeight = 25;
const virtualCanvas = document.createElement('canvas');
const spriteSheet = new SpriteSheet({ x: spriteWidth, y: spriteHeight }, '/dist/assets/img/fira_code_regular_14.png', Sprites, SpriteColors);
const viewport = new ViewPort({x: 64, y: 32}, viewportCanvas, spriteSheet, SpriteColors[SpriteColor.black]);

const game = new ClientGame(virtualCanvas, spriteSheet, viewport);
virtualCanvas.width = spriteWidth * game.dungeonX;
virtualCanvas.height = spriteHeight * game.dungeonY;

spriteSheet.onReady(() => {
    const ws = new WebSocket('ws://localhost:8888');
    NetworkEventHandler.setConnecton(ws);

    ws.onmessage = async (event) => {
        const arrayBuffer = await new Response(event.data).arrayBuffer()
        const events: NetworkEvent[] = decode(arrayBuffer);
        events.forEach((evData: NetworkEvent) => {
            // ignore any events that were before the game was initialized
            // if a client connects in the middle of a tick cycle, it's possible
            // that there are events queued that will be included in the initEvent
            if (game.timeInitialized === undefined || game.timeInitialized < evData.ts) {
                NetworkEventHandler.handleEvent(game, evData);
            }
        });
    };
});

// For debugging
(window as any).game = game;
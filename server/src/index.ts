import * as WebSocket from 'ws';
import { Game } from "./models/Game";

const game = new Game();
const wss = new WebSocket.Server({ port: 8888});

wss.on('connection', (ws) => {
    console.log('client connected');
    ws.send(JSON.stringify(game.currentDungeon)); 
});
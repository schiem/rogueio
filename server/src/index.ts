import * as WebSocket from 'ws';
import { ServerGame } from './models/ServerGame';
import { InitEvent } from '../../common/src/events/server/InitEvent';

const game = new ServerGame();
const wss = new WebSocket.Server({ port: 8888});

wss.on('connection', (ws) => {
    console.log('client connected');
    const playerId = game.playerConnected();
    ws.send(
        JSON.stringify(
            new InitEvent(game, playerId)
        )
    ); 
});
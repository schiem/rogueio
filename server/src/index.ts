import * as WebSocket from 'ws';
import { ServerGame } from './models/ServerGame';
import { InitEvent } from '../../common/src/events/server/InitEvent';
import { ClientEvent } from '../../common/src/events/client/ClientEvent';

const game = new ServerGame();
const wss = new WebSocket.Server({ port: 8888});

wss.on('connection', (ws) => {
    const playerId = game.playerConnected(ws);
    ws.send(
        // send the initial event
        JSON.stringify(
            [new InitEvent(game, playerId)]
        )
    ); 

    ws.onmessage = (event) => {
        const eventData: ClientEvent = JSON.parse(event.data as string);
        game.networkEventManager.handleEvent(playerId, game, eventData);
    };

    ws.on('close', () => {
        game.playerDisconnected(playerId);
    });
});
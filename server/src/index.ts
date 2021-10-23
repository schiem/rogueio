import * as WebSocket from 'ws';
import { ServerGame } from './models/ServerGame';
import { InitEvent } from '../../common/src/events/server/InitEvent';
import { ClientEvent } from '../../common/src/events/client/ClientEvent';
import { decode } from "messagepack";

const game = new ServerGame();
const wss = new WebSocket.Server({ port: 8888});

wss.on('connection', (ws) => {
    const playerId = game.playerConnected(ws);
    // send the initial event
    game.networkEventManager.queueEvent(new InitEvent(game, playerId), game.players[playerId].characterId);

    ws.onmessage = (event) => {
        const eventData: ClientEvent = decode(event.data as Buffer);
        game.networkEventManager.handleEvent(playerId, game, eventData);
    };

    ws.on('close', () => {
        game.playerDisconnected(playerId);
    });
});
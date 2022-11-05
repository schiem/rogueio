import * as WebSocket from 'ws';
import { ServerGame } from './models/ServerGame';
import { InitEvent } from '../../common/src/events/server/InitEvent';
import { ClientEvent } from '../../common/src/events/client/ClientEvent';
import { decode } from "messagepack";
import * as readline from 'node:readline';
import { stdin as input, stdout as output } from 'process';

const game = new ServerGame();
const wss = new WebSocket.Server({ port: 8888,   
    /** Consider enabling this in production
    perMessageDeflate: {
        zlibDeflateOptions: {
            // See zlib defaults.
            chunkSize: 1024,
            memLevel: 7,
            level: 3
        },
        zlibInflateOptions: {
            chunkSize: 10 * 1024
        },
        // Other options settable:
        clientNoContextTakeover: false, // Defaults to negotiated value.
        serverNoContextTakeover: false, // Defaults to negotiated value.
        serverMaxWindowBits: 10, // Defaults to negotiated value.
        // Below options specified as default values.
        concurrencyLimit: 10, // Limits zlib concurrency for perf.
        //threshold: 1024 // Size (in bytes) below which messages should not be compressed if context takeover is disabled.
    }
    */
});

wss.on('connection', (ws) => {
    const playerId = game.playerConnected(ws);
    // send the initial event
    game.networkEventManager.queueEventForPlayer(playerId, new InitEvent(game, game.entityManager, playerId));

    ws.onmessage = (event) => {
        const eventData: ClientEvent = decode(event.data as Buffer);
        game.networkEventManager.handleEvent(playerId, eventData);
    };

    ws.on('close', () => {
        game.playerDisconnected(playerId);
    });
});

// TODO - abstract this? remove it from production builds?
const rl = readline.createInterface({ input, output });
rl.on('line', (line) => {
    console.log(line);
});
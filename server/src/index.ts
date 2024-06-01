import * as WebSocket from 'ws';
import { ServerGame, ServerGameSystems } from './models/ServerGame';
import { InitEvent } from '../../common/src/events/server/InitEvent';
import { ClientEvent } from '../../common/src/events/client/ClientEvent';
import { decode } from "messagepack";
import * as readline from 'node:readline';
import { stdin as input, stdout as output } from 'process';
import { Rog } from './rog/Rog';
import { ComponentSystem } from '../../common/src/systems/ComponentSystem';
import { ComponentBlock } from './generators/EntityGenerators';
import { GameSystems } from '../../common/src/models/Game';

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
const rog = new Rog();

rog.bindFunction('togglePause', () => {
    game.paused = !game.paused;
}, 0);

rog.bindFunction('getComponents', (systemName: string) => {
    const system = (game.systems as Record<string, ComponentSystem<unknown>>)[systemName];
    return system.getAllComponents();
}, 1);

rog.bindFunction('getComponent', (systemName: string, entityId: number) => {
    const system = (game.systems as Record<string, ComponentSystem<unknown>>)[systemName];
    return system.getComponent(entityId);
}, 2);

rog.bindFunction('teleportEntity', (entityId: number, x: number, y: number) => {
    const system = game.systems.location;
    const component = system.getComponent(entityId);
    if (!component) {
        return;
    }
    return system.moveAndCollideEntity(entityId, { x, y }, game.dungeonProvider.dungeon);
}, 3);

rog.bindFunction('teleportPlayersToEnemy', () => {
    const characters = Object.keys(game.players).map(x => game.players[x].characterId);
    const firstEnemy = game.systems.ally.getAlliesForGroup('enemies')[0];
    if (firstEnemy === undefined) {
        return;
    }

    const entityLocation = game.systems.location.getComponent(firstEnemy)?.location;
    if (!entityLocation) {
        return;
    }

    characters.forEach((character) => {
        const location = game.systems.location.getComponent(character)?.location;
        if (!location) {
            return;
        }

        outer_loop:
        for (let x = entityLocation.x - 1; x <= entityLocation.x + 1; x++) {
            for (let y = entityLocation.y - 1; y <= entityLocation.y + 1; y++) {
                if (game.systems.location.moveAndCollideEntity(character, { x, y }, game.dungeonProvider.dungeon)) {
                    break outer_loop;
                }
            }
        }
    });
}, 0);

rog.bindFunction('removeComponent', (systemName: string, entityId: number) => {
    const system = (game.systems as Record<string, ComponentSystem<unknown>>)[systemName];
    if (!system) {
        return;
    }

    system.removeComponentFromEntity(entityId);
}, 2);

rog.bindFunction('showPlayers', () => {
    return Object.keys(game.players).map(x => game.players[x].characterId);
}, 0);

rog.bindFunction('printEntityInfo', (entityId: number) => {
    const components: Partial<ComponentBlock> = {};
    for (const systemName in game.systems) {
        const component = game.systems[systemName as keyof ServerGameSystems].getComponent(entityId);
        if (component) {
            (components[systemName as keyof ComponentBlock] as Record<string, unknown>) = component;
        }
    }

    console.log(JSON.stringify(components, null, 2));
}, 1)

rog.bindFunction('updateComponent', (entityId: number, system: keyof GameSystems, key: string, value: any) => {
    game.systems[system].updateComponent(entityId, { [key]: value });
}, 4)

rl.on('line', (line) => {
    const result = rog.run(line);
    result.stderr.forEach((err) => {
        console.error(err);
    })
    result.stdout.forEach((out) => {
        console.log(out);
    });
});
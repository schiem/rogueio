import { Player } from "../../../common/src/models/Player";
import { DungeonGenerator } from "../generators/DungeonGenerator";
import { Game } from "../../../common/src/models/Game";
import { v4 as uuidv4 } from 'uuid';
import { NetworkEventManager } from "../events/NetworkEventManager";
import * as WebSocket from 'ws';
import { performance } from 'perf_hooks';
import { ServerVisbilitySystem } from "../systems/ServerVisbilitySystem";
import { MobSpawnGenerator, MobSpawnGeneratorName, MobSpawnGenerators, SpawnPlayerCharacter } from "../generators/SpawnGenerator";
import { random } from "../../../common/src/utils/MathUtils";

export class ServerGame extends Game {
    dungeonGenerator: DungeonGenerator;
    networkEventManager: NetworkEventManager;
    private clients: Record<string, WebSocket> = {};
    private tickSpeed = 50;
    private lastTick: number;

    constructor() {
        super();

        const maxRoomSize = {x: 30, y: 16};
        const minRoomSize = {x: 8, y: 4};
        const minRoomSpacing = 6;
        const maxRoomSpacing = 14;
        this.dungeonGenerator = new DungeonGenerator({x: this.dungeonX, y: this.dungeonY}, minRoomSize, maxRoomSize, minRoomSpacing, maxRoomSpacing, 500);

        this.newDungeon();

        // set up the visibility system, after the dungeon has been created
        this.systems.visibility = new ServerVisbilitySystem(this.entityManager, this.systems.ally, this.systems.location, this.currentLevel);

        // Add the network manager to handle events
        this.networkEventManager = new NetworkEventManager(this.systems, this.entityManager);

        this.startTick();
    }

    startTick(): void {
        this.lastTick = performance.now();
        setInterval(() => {
            const now = performance.now();
            if (now - this.lastTick > this.tickSpeed) {
                process.stdout.cursorTo(0);
                process.stdout.write((`Framerate: ${1000 / (now - this.lastTick)}`));

                this.lastTick = now;
                this.networkEventManager.flushEvents(this.clients);
            }
        }, 2);
    }

    newDungeon(): void {
        this.currentLevel = this.dungeonGenerator.generate();
        this.spawnMobs();
        this.spawnItems();
    }

    spawnMobs(): void {
        this.currentLevel.rooms.forEach((room) => {
            const possibleSpawners: MobSpawnGenerator[] = [];
            for(let spawnName in MobSpawnGenerators) {
                const spawner = MobSpawnGenerators[spawnName as unknown as MobSpawnGeneratorName];
                if (room.spawnerIsValid(spawner)) {
                    possibleSpawners.push(spawner);
                }
            }
            if (!possibleSpawners.length) {
                return;
            }
            const spawner = possibleSpawners[random(0, possibleSpawners.length)];
            spawner.doSpawn(this.currentLevel, room, this.entityManager, this.systems);
        });
    }

    spawnItems(): void {

    }

    playerConnected(ws: WebSocket, playerId?: string): string {
        if (playerId === undefined) {
            playerId = uuidv4();
        }
        this.clients[playerId] = ws;
        const player = new Player(playerId);
        player.characterId = this.entityManager.addNextEntity();
        this.players[playerId] = player;

        SpawnPlayerCharacter(player.characterId, this.systems, this.currentLevel);
        this.networkEventManager.addPlayerEventQueue(playerId);

        let str = 10;
        setInterval(() => {
            str++;
            this.systems.stats.updateComponent(player.characterId, {'max.str': str})
        }, 2000);

        return playerId;
    }

    playerDisconnected(playerId: string): void {
        this.entityManager.removeEntity(this.players[playerId].characterId);
        this.networkEventManager.removePlayerEventQueue(playerId);
        delete this.players[playerId];
        delete this.clients[playerId];
    }

    toJSON(): any {
        return {
        } as Game;
    }
}
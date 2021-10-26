import { Player } from "../../../common/src/models/Player";
import { DungeonGenerator } from "../generators/DungeonGenerator";
import { Game, GameSystems } from "../../../common/src/models/Game";
import { v4 as uuidv4 } from 'uuid';
import { NetworkEventManager } from "../events/NetworkEventManager";
import * as WebSocket from 'ws';
import { performance } from 'perf_hooks';
import { ServerVisbilitySystem } from "../systems/ServerVisbilitySystem";
import { MobSpawnGenerator, MobSpawnGeneratorName, MobSpawnGenerators, SpawnPlayerCharacter } from "../generators/SpawnGenerator";
import { random } from "../../../common/src/utils/MathUtils";
import { AISystem } from "../systems/AISystem";

export type ServerGameSystems = GameSystems & {
    ai: AISystem;
    visibility: ServerVisbilitySystem
}
export class ServerGame extends Game {
    systems: ServerGameSystems;
    dungeonGenerator: DungeonGenerator;
    networkEventManager: NetworkEventManager;
    private clients: Record<string, WebSocket> = {};
    private tickSpeed = 66.6666;
    private lastTick: number;

    constructor() {
        super();

        const maxRoomSize = {x: 30, y: 16};
        const minRoomSize = {x: 8, y: 4};
        const minRoomSpacing = 6;
        const maxRoomSpacing = 14;
        const dungeonSize = {x: this.dungeonX, y: this.dungeonY };
        this.dungeonGenerator = new DungeonGenerator(dungeonSize, minRoomSize, maxRoomSize, minRoomSpacing, maxRoomSpacing, 500);


        // set up the visibility system, after the dungeon has been created
        this.systems.visibility = new ServerVisbilitySystem(this.entityManager, this.systems.ally, this.systems.location, dungeonSize);

        // set up the AI system
        this.systems.ai = new AISystem(this.entityManager);

        this.newDungeon();
        this.systems.visibility.setDungeon(this.currentLevel);

        // Add the network manager to handle events
        this.networkEventManager = new NetworkEventManager(this.players, this.systems, this.entityManager);

        this.startTick();
    }

    startTick(): void {
        this.lastTick = performance.now();
        setInterval(() => {
            const now = performance.now();
            const delta = now - this.lastTick;
            if (delta > this.tickSpeed) {
                process.stdout.cursorTo(0);
                process.stdout.write((`Framerate: ${1000 / (now - this.lastTick)}`));

                this.lastTick = now;
                this.systems.ai.runAI(delta, this.systems, this.currentLevel);
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
        const player = new Player(playerId);
        this.clients[playerId] = ws;
        this.players[playerId] = player;
        this.networkEventManager.addPlayerEventQueue(playerId);


        player.characterId = this.entityManager.addNextEntity();
        SpawnPlayerCharacter(player.characterId, this.systems, this.currentLevel);

        return playerId;
    }

    playerDisconnected(playerId: string): void {
        this.entityManager.removeEntity(this.players[playerId].characterId);
        this.networkEventManager.removePlayerEventQueue(playerId);
        delete this.players[playerId];
        delete this.clients[playerId];
    }
}
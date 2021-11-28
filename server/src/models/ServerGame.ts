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
import { MessageData, MessageEvent } from "../../../common/src/events/server/MessageEvent";
import { ServerActionSystem } from "../systems/ServerActionSystem";
import { ServerDungeon } from "./ServerDungeon";
import { HealthSystem } from "../../../common/src/systems/HealthSystem";
import { LocationSystem } from "../../../common/src/systems/LocationSystem";

export type ServerGameSystems = GameSystems & {
    ai: AISystem;
    visibility: ServerVisbilitySystem;
    action: ServerActionSystem;
}
export class ServerGame extends Game {
    systems: ServerGameSystems;
    dungeonGenerator: DungeonGenerator;
    currentLevel: ServerDungeon;
    networkEventManager: NetworkEventManager;
    private clients: Record<string, WebSocket> = {};
    private fps = 15;
    private tickSpeed: number
    private lastTick: number;

    constructor() {
        super();

        this.tickSpeed = 1000 / this.fps;
        const maxRoomSize = {x: 30, y: 16};
        const minRoomSize = {x: 8, y: 4};
        const minRoomSpacing = 6;
        const maxRoomSpacing = 14;
        const dungeonSize = {x: this.dungeonX, y: this.dungeonY };
        this.dungeonGenerator = new DungeonGenerator(dungeonSize, minRoomSize, maxRoomSize, minRoomSpacing, maxRoomSpacing, 500);

        this.constructSystems();

        // Add the network manager to handle events
        this.networkEventManager = new NetworkEventManager(this.players, this.systems, this.entityManager);

        this.startTick();
    }

    constructSystems(): void {
        this.systems.health = new HealthSystem(this.entityManager);
        this.systems.location = new LocationSystem(this.entityManager, { x: this.dungeonX, y: this.dungeonY });

        // Construct the common systems
        super.constructSystems();


        // set up the visibility system, after the dungeon has been created
        this.systems.visibility = new ServerVisbilitySystem(this.entityManager, this.systems.ally, this.systems.location, this.systems.health, this.dungeonGenerator.dungeonSize);

        // set up the AI system
        this.systems.ai = new AISystem(this.entityManager);
        

        this.newDungeon();

        this.systems.action = new ServerActionSystem(this.entityManager, this.systems.location, this.systems.visibility, this.systems.ally, this.systems.health, this.currentLevel);
        this.systems.visibility.setDungeon(this.currentLevel);
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

    sendMessage(to: string, message: MessageData): void {
        if (!this.players[to]) {
            throw new Error('could not send message to player');
        }
        this.networkEventManager.queueEventForPlayer(to, new MessageEvent(message))
    }

    sendMessageForCharacterId(id: number, message: MessageData): void {
        let playerId: string | undefined;
        for(const key in this.players) {
            if (this.players[key].characterId === id) {
                playerId = key;
            }
        }

        if (playerId === undefined) {
            return;
        }
        this.sendMessage(playerId, message);
    }

    broadCastMessage(message: MessageData): void {
        this.networkEventManager.queueEvent(new MessageEvent(message));
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
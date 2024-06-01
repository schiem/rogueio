import { Player } from "../../../common/src/models/Player";
import { DungeonGenerator } from "../generators/DungeonGenerator";
import { Game, GameSystems } from "../../../common/src/models/Game";
import { v4 as uuidv4 } from 'uuid';
import { NetworkEventManager } from "../events/NetworkEventManager";
import * as WebSocket from 'ws';
import { performance } from 'perf_hooks';
import { ServerVisbilitySystem } from "../systems/ServerVisbilitySystem";
import { random, randomList } from "../../../common/src/utils/MathUtils";
import { AISystem } from "../systems/AISystem";
import { ServerActionSystem } from "../systems/ServerActionSystem";
import { ServerDungeon } from "./ServerDungeon";
import { LocationSystem } from "../../../common/src/systems/LocationSystem";
import { DescriptionSystem } from "../../../common/src/systems/DescriptionSystem";
import { PlayerSpawner } from "../generators/PlayerSpawner";
import { MonsterSpawners, MonsterRoomSpawners } from "../generators/MonsterSpawners/MonsterSpawner";
import { RoomFeatureSpawners } from "./RoomFeatures";
import { ServerInventorySystem } from "../systems/ServerInventorySystem";
import { ServerMovementSystem } from "../systems/ServerMovementSystem";
import { ServerEquipmentSystem } from "../systems/ServerEquipmentsystem";
import { RoomType } from "./RoomType";
import { ServerHealthSystem } from "../systems/ServerHealthSystem";
import { ServerConsumableSystem } from "../systems/ServerConsumableSystem";

export type ServerGameSystems = GameSystems & {
    ai: AISystem;
    visibility: ServerVisbilitySystem;
    action: ServerActionSystem;
    inventory: ServerInventorySystem;
    movement: ServerMovementSystem;
    equipment: ServerEquipmentSystem;
    health: ServerHealthSystem;
    consumable: ServerConsumableSystem;
}

export type ServerDungeonProvider = {
    dungeon: ServerDungeon;
}

export class ServerGame extends Game {
    systems: ServerGameSystems;
    dungeonGenerator: DungeonGenerator;
    dungeonProvider: ServerDungeonProvider;
    networkEventManager: NetworkEventManager;
    paused = false;
    private clients: Record<string, WebSocket> = {};
    private fps = 15;
    private tickSpeed: number
    private currentTime: number;

    constructor() {
        super();

        this.tickSpeed = 1000 / this.fps;
        const maxRoomSize = {x: 20, y: 12};
        const minRoomSize = {x: 4, y: 4};
        const minRoomSpacing = 4;
        const maxRoomSpacing = 8;
        // Tiles are 14x25.  The aspect ratio to produce visually square rooms is 25/14 = 1.786
        const minAspectRatio = 1.286;
        const maxAspectRatio = 2.286; 

        const dungeonSize = {x: this.dungeonX, y: this.dungeonY };
        this.dungeonGenerator = new DungeonGenerator(dungeonSize, minRoomSize, maxRoomSize, minAspectRatio, maxAspectRatio, minRoomSpacing, maxRoomSpacing, 200);

        this.constructSystems();

        // Add the network manager to handle events
        this.networkEventManager = new NetworkEventManager(this.players, this.systems, this.entityManager);

        this.startTick();
    }

    constructSystems(): void {
        this.systems.description = new DescriptionSystem(this.entityManager);
        this.systems.health = new ServerHealthSystem(this.entityManager);
        this.systems.location = new LocationSystem(this.entityManager, { x: this.dungeonX, y: this.dungeonY });

        // Construct the common systems
        super.constructSystems();

        this.systems.movement = new ServerMovementSystem(this.entityManager, this.systems.location);
        this.systems.inventory = new ServerInventorySystem(this.entityManager, this.systems.location, this.systems.carryable, this.dungeonProvider);
        this.systems.equipment = new ServerEquipmentSystem(this.entityManager, this.dungeonProvider, this.systems.equippable, this.systems.inventory, this.systems.location);

        this.systems.consumable = new ServerConsumableSystem(this.entityManager, this.systems.location, this.systems.inventory, this.systems.health);

        // set up the visibility system, after the dungeon has been created
        this.systems.visibility = new ServerVisbilitySystem(this.entityManager, this.systems.ally, this.systems.location, this.systems.health, this.dungeonGenerator.dungeonSize, this.systems.inventory, this.systems.equipment, this.dungeonProvider);
        this.systems.action = new ServerActionSystem(this.entityManager, this.systems.location, this.systems.visibility, this.systems.ally, this.systems.health, this.dungeonProvider);

        // set up the AI system
        this.systems.ai = new AISystem(this.entityManager);

        this.newDungeon();
    }

    startTick(): void {
        this.currentTime = performance.now();
        setInterval(() => {
            const now = performance.now();
            const delta = now - this.currentTime;
            if (delta > this.tickSpeed) {
                this.currentTime += delta;
                this.tick();
            }
        }, 2);
    }

    newDungeon(): void {
        this.dungeonProvider.dungeon = this.dungeonGenerator.generate();
        this.spawnMonsters();
        this.spawnItems();
    }

    spawnMonsters(): void {
        this.dungeonProvider.dungeon.rooms.forEach((room) => {
            // Select an appropriate spawner
            if (MonsterRoomSpawners[room.type].length === 0) {
                return;
            }

            const spawner = MonsterSpawners[randomList(MonsterRoomSpawners[room.type])];

            // Make sure the room as all the necessary features for that spawner
            for (let i = 0; i < spawner.requires.length; i++) {
                const feature = spawner.requires[i];
                
                // Already haave this feature, skip it
                if (room.features[feature] !== undefined) {
                    continue;
                }

                const valid = RoomFeatureSpawners[feature](room, this.dungeonProvider.dungeon);
                if (!valid) {
                    // TODO - handle not being able to spawn correctly
                    return;
                }
            }

            // Spawn things
            spawner.doSpawn(room, this.dungeonProvider.dungeon, this.entityManager, this.systems);
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


        player.characterId = this.entityManager.peekNextEntity();
        const roomsAvailable = this.dungeonProvider.dungeon.rooms.filter((room) => {
            return room.spawnTiles.length > 0 && room.type === RoomType.active;
        });
        if (roomsAvailable.length > 0) {
            const idx = random(0, roomsAvailable.length);
            const room = roomsAvailable[idx];

            PlayerSpawner.doSpawn(room, this.dungeonProvider.dungeon, this.entityManager, this.systems);
        }

        return playerId;
    }

    playerDisconnected(playerId: string): void {
        this.entityManager.removeEntity(this.players[playerId].characterId);
        this.networkEventManager.removePlayerEventQueue(playerId);
        delete this.players[playerId];
        delete this.clients[playerId];
    }

    private tick(): void {
        if (this.paused) {
            return;
        }

        // Run received events from player
        this.networkEventManager.doReceivedEvents(this, this.currentTime);

        // Run the AI
        this.systems.ai.runAI(this.currentTime, this.systems, this.dungeonProvider.dungeon);

        // Send the modified state back to the player
        this.networkEventManager.flushSendEvents(this.clients);
    }
}
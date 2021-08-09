import { Player } from "../../../common/src/models/Player";
import { DungeonGenerator } from "../generators/DungeonGenerator";
import { Game } from "../../../common/src/models/Game";
import { v4 as uuidv4 } from 'uuid';
import { generatePlayerCharacter } from "../../../common/src/entities/EntityGenerators";
import { NetworkEventManager } from "../events/NetworkEventManager";
import * as WebSocket from 'ws';

export class ServerGame extends Game {
    dungeonGenerator: DungeonGenerator;
    networkEventManager: NetworkEventManager;
    private clients: Record<string, WebSocket> = {};
    private tickSpeed = 100;
    private lastTick: number;

    constructor() {
        super();

        this.networkEventManager = new NetworkEventManager(this.systems, this.entityManager);

        const maxRoomSize = {x: 30, y: 16};
        const minRoomSize = {x: 8, y: 4};
        const minRoomSpacing = 6;
        const maxRoomSpacing = 14;
        this.dungeonGenerator = new DungeonGenerator({x: this.dungeonX, y: this.dungeonY}, minRoomSize, maxRoomSize, minRoomSpacing, maxRoomSpacing, 500);

        this.newDungeon();
        this.startTick();
    }

    startTick(): void {
        this.lastTick = new Date().getTime();
        setInterval(() => {
            const now = new Date().getTime();
            if (now - this.lastTick > this.tickSpeed) {
                this.lastTick = now;
                this.networkEventManager.flushEvents(
                    Object.keys(this.clients).map((client) => this.clients[client])
                );
            }
        }, 5);
    }

    newDungeon(): void {
        this.currentLevel = this.dungeonGenerator.generate();
    }

    playerConnected(ws: WebSocket, playerId?: string): string {
        if (playerId === undefined) {
            playerId = uuidv4();
        }
        this.clients[playerId] = ws;
        const player = new Player(playerId);
        player.characterId = this.entityManager.addNextEntity();
        this.players[playerId] = player;

        generatePlayerCharacter(player.characterId, this.systems, this.currentLevel);

        return playerId;
    }

    playerDisconnected(playerId: string): void {
        this.entityManager.removeEntity(this.players[playerId].characterId);
        delete this.players[playerId];
        delete this.clients[playerId];
    }

    toJSON(): any {
        return {
            dungeonX: this.dungeonX,
            dungeonY: this.dungeonY,
            currentLevel: this.currentLevel,
            systems: this.systems,
            players: this.players,
            entityManager: this.entityManager
        } as Game;
    }
}
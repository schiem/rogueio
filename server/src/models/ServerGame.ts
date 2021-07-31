import { Player } from "../../../common/src/models/Player";
import { DungeonGenerator } from "../generators/DungeonGenerator";
import { Game } from "../../../common/src/models/Game";
import { v4 as uuidv4 } from 'uuid';
import { ServerDungeon } from "./ServerDungeon";

export class ServerGame extends Game {
    dungeonGenerator: DungeonGenerator;
    currentDungeon: ServerDungeon;

    constructor() {
        super();
        const maxRoomSize = {x: 30, y: 16};
        const minRoomSize = {x: 8, y: 4};
        const minRoomSpacing = 6;
        const maxRoomSpacing = 14;
        this.dungeonGenerator = new DungeonGenerator({x: this.dungeonX, y: this.dungeonY}, minRoomSize, maxRoomSize, minRoomSpacing, maxRoomSpacing, 500);

        this.newDungeon();
    }

    newDungeon() {
        this.currentDungeon = this.dungeonGenerator.generate();
    }

    playerConnected(playerId?: string): string {
        if (playerId === undefined) {
            playerId = uuidv4();
        }
        const player = new Player(playerId);
        this.players[playerId] = player;

        const spawnLocation = this.currentDungeon.spawnCharacter(player.character);
        if (spawnLocation) {
            player.location = spawnLocation;
        }

        return playerId;
    }

    playerDisconnected(playerId: string): void {
        this.currentDungeon.removeCharacterAt(this.players[playerId].location)
        delete this.players[playerId];
    }
}
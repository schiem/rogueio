import { Dungeon } from "../../../common/src/models/Dungeon";
import { Player } from "../../../common/src/models/Player";
import { DungeonGenerator } from "../generators/DungeonGenerator";

export class Game {
    dungeonX = 256;
    dungeonY = 128;

    currentDungeon?: Dungeon;
    dungeonGenerator: DungeonGenerator;
    players: Player[] = [];

    constructor() {
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
}
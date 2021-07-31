import { Dungeon } from "../../../common/src/models/Dungeon";
import { Player } from "./Player";
export declare class Game {
    dungeonX: number;
    dungeonY: number;
    currentDungeon: Dungeon;
    players: Record<string, Player>;
    constructor();
}

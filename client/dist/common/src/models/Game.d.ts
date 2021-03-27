import { Dungeon } from "./Dungeon";
import { Player } from "./Player";
export declare class Game {
    dungeonX: number;
    dungeonY: number;
    currentDungeon?: Dungeon;
    players: Player[];
}

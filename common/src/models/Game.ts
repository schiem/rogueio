import { Dungeon } from "./Dungeon";
import { Player } from "./Player";

export class Game {
    dungeonX = 256;
    dungeonY = 128;

    currentDungeon?: Dungeon;
    players: Player[] = [];
}
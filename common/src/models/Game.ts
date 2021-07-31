import { Dungeon } from "../../../common/src/models/Dungeon";
import { Player } from "./Player";

export class Game {
    dungeonX: number = 256;
    dungeonY: number = 128;

    currentDungeon: Dungeon;
    players: Record<string, Player> = {};

    constructor() {}
}
import { LocationSystem } from "../systems/LocationSystem";
import { Dungeon } from "./Dungeon";
import { EntityManager } from "../entities/EntityManager";
import { Player } from "./Player";

export type GameSystems = {
    location: LocationSystem
}

export class Game {
    dungeonX: number = 256;
    dungeonY: number = 128;

    currentLevel: Dungeon;
    players: Record<string, Player> = {};

    entityManager = new EntityManager();

    systems: GameSystems = {
        location: new LocationSystem(this.entityManager, { x: this.dungeonX, y: this.dungeonY })
    };

    constructor() {}
}
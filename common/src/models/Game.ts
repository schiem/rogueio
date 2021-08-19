import { LocationSystem } from "../systems/LocationSystem";
import { Dungeon } from "./Dungeon";
import { EntityManager } from "../entities/EntityManager";
import { Player } from "./Player";
import { MovementSystem } from "../systems/MovementSystem";
import { VisiblitySystem } from "../systems/VisibilitySystem";

export type GameSystems = {
    location: LocationSystem;
    movement: MovementSystem;
    visibility: VisiblitySystem;
}

export class Game {
    dungeonX: number = 256;
    dungeonY: number = 128;

    currentLevel: Dungeon;
    players: Record<string, Player> = {};

    entityManager = new EntityManager();

    systems: GameSystems = {} as GameSystems;

    constructor() {
        this.systems.location = new LocationSystem(this.entityManager, { x: this.dungeonX, y: this.dungeonY });
        this.systems.movement = new MovementSystem(this.systems.location, this.entityManager);
    }
}
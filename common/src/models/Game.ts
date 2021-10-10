import { LocationSystem } from "../systems/LocationSystem";
import { Dungeon } from "./Dungeon";
import { EntityManager } from "../entities/EntityManager";
import { Player } from "./Player";
import { MovementSystem } from "../systems/MovementSystem";
import { VisibilitySystem } from "../systems/VisibilitySystem";
import { AllySystem } from "../systems/AllySystem";
import { StatSystem } from "../systems/StatSystem";

export type GameSystems = {
    location: LocationSystem;
    movement: MovementSystem;
    visibility: VisibilitySystem;
    ally: AllySystem;
    stats: StatSystem;
}

export class Game {
    dungeonX: number = 256;
    dungeonY: number = 128;

    currentLevel: Dungeon;
    players: Record<string, Player> = {};

    entityManager = new EntityManager();

    systems: GameSystems = {} as GameSystems;

    constructor() {
        this.systems.stats = new StatSystem(this.entityManager);
        this.systems.location = new LocationSystem(this.entityManager, { x: this.dungeonX, y: this.dungeonY });
        this.systems.ally = new AllySystem(this.entityManager);
        this.systems.movement = new MovementSystem(this.systems.location, this.entityManager);
    }
}
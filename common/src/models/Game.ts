import { LocationSystem } from "../systems/LocationSystem";
import { Dungeon } from "./Dungeon";
import { EntityManager } from "../entities/EntityManager";
import { Player } from "./Player";
import { MovementSystem } from "../systems/MovementSystem";
import { VisibilitySystem } from "../systems/VisibilitySystem";
import { AllySystem } from "../systems/AllySystem";
import { StatSystem } from "../systems/StatSystem";
import { ActionSystem } from "../systems/ActionSystem";
import { HealthSystem } from "../systems/HealthSystem";
import { DescriptionSystem } from "../systems/DescriptionSystem";

export type GameSystems = {
    description: DescriptionSystem;
    location: LocationSystem;
    movement: MovementSystem;
    visibility: VisibilitySystem;
    ally: AllySystem;
    stats: StatSystem;
    action: ActionSystem;
    health: HealthSystem;
}

export class Game {
    dungeonX: number = 256;
    dungeonY: number = 128;

    currentLevel: Dungeon;
    players: Record<string, Player> = {};

    entityManager = new EntityManager();

    systems: GameSystems = {} as GameSystems;

    constructor() {
    }

    constructSystems(): void {
        this.systems.stats = new StatSystem(this.entityManager, this.systems.health);
        this.systems.ally = new AllySystem(this.entityManager, this.systems.health);
        this.systems.movement = new MovementSystem(this.entityManager, this.systems.location, this.systems.health);
    }
}
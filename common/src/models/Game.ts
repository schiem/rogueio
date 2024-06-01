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
import { InventorySystem } from "../systems/InventorySystem";
import { CarryableSystem } from "../systems/CarryableComponent";
import { SpriteSystem } from "../systems/SpriteSystem";
import { EquipmentSystem } from "../systems/EquipmentSystem";
import { EquippableSystem } from "../systems/EquippableSystem";
import { ConsumableSystem } from "../systems/ConsumableSystem";

export type GameSystems = {
    description: DescriptionSystem;
    location: LocationSystem;
    movement: MovementSystem;
    visibility: VisibilitySystem;
    ally: AllySystem;
    stats: StatSystem;
    action: ActionSystem;
    health: HealthSystem;
    inventory: InventorySystem;
    carryable: CarryableSystem;
    sprite: SpriteSystem;
    equipment: EquipmentSystem;
    equippable: EquippableSystem;
    consumable: ConsumableSystem;
}

export type DungeonProvider = {
    dungeon: Dungeon;
}

export class Game {
    dungeonX: number = 128;
    dungeonY: number = 128;

    players: Record<string, Player> = {};

    entityManager = new EntityManager();

    systems: GameSystems = {} as GameSystems;
    dungeonProvider: DungeonProvider = {} as DungeonProvider;

    constructor() {
    }

    constructSystems(): void {
        this.systems.stats = new StatSystem(this.entityManager);
        this.systems.sprite = new SpriteSystem(this.entityManager);
        this.systems.ally = new AllySystem(this.entityManager);
        this.systems.carryable = new CarryableSystem(this.entityManager);
        this.systems.equippable = new EquippableSystem(this.entityManager);
        this.systems.equipment = new EquipmentSystem(this.entityManager);
    }
}
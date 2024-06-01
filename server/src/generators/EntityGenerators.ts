import { ActionComponent, ActionTarget, EffectTarget, EffectType } from "../../../common/src/components/ActionComponent";
import { AllyComponent } from "../../../common/src/components/AllyComponent";
import { ConsumableCategory, ConsumableComponent, ConsumableType } from "../../../common/src/components/ConsumableComponent";
import { DescriptionComponent, CharacterType, EntityCategory, ItemType } from "../../../common/src/components/DescriptionComponent";
import { EquipmentComponent, EquipmentSlot } from "../../../common/src/components/EquipmentComponent";
import { EquippableComponent } from "../../../common/src/components/EquippableComponent";
import { HealthComponent } from "../../../common/src/components/HealthComponent";
import { InventoryComponent } from "../../../common/src/components/InventoryComponent";
import { LocationComponent, LocationComponentLayer } from "../../../common/src/components/LocationComponent";
import { MovementComponent } from "../../../common/src/components/MovementComponent";
import { SpriteComponent } from "../../../common/src/components/SpriteComponent";
import { StatComponent } from "../../../common/src/components/StatComponent";
import { VisibilityComponent } from "../../../common/src/components/VisibilityComponent";
import { ComponentSystem } from "../../../common/src/systems/ComponentSystem";
import { SpriteColor, SpriteName } from "../../../common/src/types/Sprite";
import { MovementType } from "../../../common/src/types/Tile";
import { AIComponent } from "../components/AIComponent";
import { ServerGameSystems } from "../models/ServerGame";
import { generateGenericAI, generateWanderAI } from "./AIGenerators/GenericAI";

export type ComponentBlock = {
    location: LocationComponent;
    movement: MovementComponent;
    visibility: VisibilityComponent;
    ally: AllyComponent;
    stats: StatComponent;
    ai: AIComponent;
    action: ActionComponent;
    health: HealthComponent;
    description: DescriptionComponent;
    inventory: InventoryComponent;
    sprite: SpriteComponent;
    equippable: EquippableComponent;
    equipment: EquipmentComponent;
    consumable: ConsumableComponent;
}

export const mobEntities: Record<CharacterType, () => Partial<ComponentBlock>> = {
    [CharacterType.player]: () => {
        return {
            description: { id: CharacterType.player, category: EntityCategory.character },
            health: {current: 10, max: 10},
            ally: {group: 'players'},
            sprite: {
                sprite: {
                    name: SpriteName.player,
                    color: SpriteColor.beige
                }
            },
            location: {
                movesThrough: [MovementType.land, MovementType.water],
                layer: LocationComponentLayer.character,
            },
            movement: { minMovementDelay: 100 },
            visibility: { sightRadius: 6, visible: {} },
            stats: {
                current: {
                    str: 10,
                    con: 10,
                    dex: 10
                },
                max: {
                    str: 10,
                    con: 10,
                    dex: 10
                },
            },
            action: {
                actions: [{
                    cooldown: 200,
                    range: 1,
                    targetType: {
                        target: ActionTarget.entity,
                    },
                    effects: [
                        {
                            type: EffectType.attack,
                            target: EffectTarget.enemy,
                            damage: {min: 0, max: 4}
                        }
                    ]
                }]
            },
            inventory: {
                items: [],
                maxSpace: 10,
            },
            equipment: {
                items: {}
            }
        };
    },
    [CharacterType.bufonidWarrior]: () => {
        return {
            description: { id: CharacterType.bufonidWarrior, category: EntityCategory.character  },
            health: {current: 10, max: 10},
            ally: {group: 'enemies'},
            sprite: {
                sprite: {
                    name: SpriteName.bufonid,
                    color: SpriteColor.green,
                }
            },
            location: {
                movesThrough: [MovementType.land, MovementType.water],
                layer: LocationComponentLayer.character,
            },
            movement: { minMovementDelay: 100 },
            stats: {
                current: {
                    str: 4,
                    con: 4,
                    dex: 4 
                },
                max: {
                    str: 4,
                    con: 4,
                    dex: 4 
                },
            },
            action: {
                actions: [{
                    cooldown: 1000,
                    range: 1,
                    targetType: {
                        target: ActionTarget.entity,
                    },
                    effects: [
                        {
                            type: EffectType.attack,
                            target: EffectTarget.enemy,
                            damage: {min: 0, max: 2}
                        }
                    ]
                }],
            },
            ai: generateGenericAI()
        };
    },
    [CharacterType.bufonidQueen]: () => {
        return {
            description: { id: CharacterType.bufonidQueen, category: EntityCategory.character  },
            health: {current: 10, max: 10},
            ally: {group: 'enemies'},
            sprite: {
                sprite: {
                    name: SpriteName.bufonid,
                    color: SpriteColor.red
                }
            },
            location: {
                movesThrough: [MovementType.land, MovementType.water],
                layer: LocationComponentLayer.character,
            },
            movement: { minMovementDelay: 200 },
            stats: {
                current: {
                    str: 8,
                    con: 8,
                    dex: 8
                },
                max: {
                    str: 8,
                    con: 8,
                    dex: 8 
                },
            },
            action: {
                actions: [{
                    cooldown: 5000,
                    range: 1,
                    targetType: {
                        target: ActionTarget.entity,
                    },
                    effects: [
                        {
                            type: EffectType.attack,
                            target: EffectTarget.enemy,
                            damage: {min: 0, max: 1}
                        }
                    ]
                }]
            },
            ai: generateGenericAI()
        };
    },
    [CharacterType.bufonidSpawn]: () => {
        return {
            description: { id: CharacterType.bufonidSpawn, category: EntityCategory.character  },
            health: {current: 1, max: 1},
            ally: {group: 'enemies'},
            sprite: {
                sprite: {
                    name: SpriteName.spawn,
                    color: SpriteColor.cyan
                }
            },
            location: {
                movesThrough: [MovementType.water],
                layer: LocationComponentLayer.character,
            },
            movement: { minMovementDelay: 400 },
            stats: {
                current: {
                    str: 0,
                    con: 0,
                    dex: 0
                },
                max: {
                    str: 0,
                    con: 0,
                    dex: 0
                },
            },
            ai: generateWanderAI()
        };
    },
};

export const itemEntities: Record<ItemType, () => Partial<ComponentBlock>> = {
    [ItemType.dagger]: () => {
        return {
            description: { id: ItemType.dagger, category: EntityCategory.item },
            sprite: {
                sprite: {
                    name: SpriteName.dagger,
                    color: SpriteColor.blue
                }
            },
            location: {
                movesThrough: [],
                layer: LocationComponentLayer.item,
            },
            carryable: {
                stackable: false
            },
            equippable: {
                slots: [EquipmentSlot.leftHand, EquipmentSlot.rightHand]
            }
        }
    }
}

export const consumableEntities: Record<ConsumableType, () => Partial<ComponentBlock>> = {
    [ConsumableType.lesserHealing]: () => {
        return {
            description: { id: ConsumableType.lesserHealing, category: EntityCategory.consumable },
            sprite: {
                sprite: {
                    name: SpriteName.potion,
                    color: SpriteColor.red
                }
            },
            location: {
                movesThrough: [],
                layer: LocationComponentLayer.item,
            },
            carryable: {
                stackable: false
            },
            consumable: {
                category: ConsumableCategory.potion,
                effect: ConsumableType.lesserHealing,
                uses: 1
            }
        }
    },
    [ConsumableType.greaterHealing]: () => {
        return {
            description: { id: ConsumableType.greaterHealing, category: EntityCategory.consumable },
            sprite: {
                sprite: {
                    name: SpriteName.potion,
                    color: SpriteColor.red
                }
            },
            location: {
                movesThrough: [],
                layer: LocationComponentLayer.item,
            },
            carryable: {
                stackable: false
            },
            consumable: {
                category: ConsumableCategory.potion,
                effect: ConsumableType.greaterHealing,
                uses: 1
            }
        }
    },
}

export const SpawnEntity = (entityId: number, components: Record<string, unknown>, systems: ServerGameSystems): void => {
    for(const system in components) {
        if(!(system in systems)) {
            throw new Error(`System does not exist: ${system}`);
        }

        // Add the component to the given system
        ((systems as Record<string, ComponentSystem<unknown>>)[system]).addComponentForEntity(entityId, components[system]);
    }
};
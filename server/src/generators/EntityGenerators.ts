import { ActionComponent, ActionTarget, EffectTarget, EffectType } from "../../../common/src/components/ActionComponent";
import { AllyComponent } from "../../../common/src/components/AllyComponent";
import { DescriptionComponent } from "../../../common/src/components/DescriptionComponent";
import { HealthComponent } from "../../../common/src/components/HealthComponent";
import { LocationComponent, LocationComponentLayers } from "../../../common/src/components/LocationComponent";
import { MovementComponent } from "../../../common/src/components/MovementComponent";
import { StatComponent } from "../../../common/src/components/StatComponent";
import { VisibilityComponent } from "../../../common/src/components/VisibilityComponent";
import { GameSystems } from "../../../common/src/models/Game";
import { ComponentSystem } from "../../../common/src/systems/ComponentSystem";
import { SpriteColor, SpriteName } from "../../../common/src/types/Sprite";
import { MovementType } from "../../../common/src/types/Tile";
import { AIComponent, AIType } from "../components/AIComponent";

export type ComponentBlock = {
    location: LocationComponent;
    movement: MovementComponent;
    visibility: VisibilityComponent;
    ally: AllyComponent;
    stats: StatComponent;
    ai: AIComponent;
    action: ActionComponent,
    health: HealthComponent,
    description: DescriptionComponent
}

export enum EntityType {
    player = 1,
    bufonidWarrior,
    bufonidQueen,
    bufonidSpawn
}
export const baseEntities: Record<EntityType, () => Partial<ComponentBlock>> = {
    [EntityType.player]: () => {
        return {
            description: {id: EntityType.player},
            health: {current: 10, max: 10},
            ally: {group: 'players'},
            location: {
                sprite: {
                    name: SpriteName.player,
                    color: SpriteColor.beige
                },
                movesThrough: [MovementType.land, MovementType.water],
                layer: LocationComponentLayers.character,
                location: { x: 0, y: 0}
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
            }
        };
    },
    [EntityType.bufonidWarrior]: () => {
        return {
            description: {id: EntityType.bufonidWarrior},
            health: {current: 10, max: 10},
            ally: {group: 'enemies'},
            location: {
                sprite: {
                    name: SpriteName.bufonid,
                    color: SpriteColor.green
                },
                movesThrough: [MovementType.land, MovementType.water],
                layer: LocationComponentLayers.character,
                location: { x: 0, y: 0}
            },
            movement: { minMovementDelay: 400 },
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
            ai: {
                type: AIType.defensive
            }
        };
    },
    [EntityType.bufonidQueen]: () => {
        return {
            description: {id: EntityType.bufonidQueen},
            health: {current: 10, max: 10},
            ally: {group: 'enemies'},
            location: {
                sprite: {
                    name: SpriteName.bufonid,
                    color: SpriteColor.red
                },
                movesThrough: [MovementType.land, MovementType.water],
                layer: LocationComponentLayers.character,
                location: { x: 0, y: 0}
            },
            movement: { minMovementDelay: 400 },
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
            ai: {
                type: AIType.defensive
            }
        };
    },
    [EntityType.bufonidSpawn]: () => {
        return {
            description: {id: EntityType.bufonidSpawn},
            health: {current: 1, max: 1},
            ally: {group: 'enemies'},
            location: {
                sprite: {
                    name: SpriteName.spawn,
                    color: SpriteColor.cyan
                },
                movesThrough: [MovementType.water],
                layer: LocationComponentLayers.character,
                location: { x: 0, y: 0}
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
            ai: {
                type: AIType.passive
            }
        };
    },
};

export const SpawnEntity = (entityId: number, components: Record<string, unknown>, systems: GameSystems): void => {
    for(const system in components) {
        if(!(system in systems)) {
            throw new Error(`System does not exist: ${system}`);
        }

        // Add the component to the given system
        ((systems as Record<string, ComponentSystem<unknown>>)[system]).addComponentForEntity(entityId, components[system]);
    }
};
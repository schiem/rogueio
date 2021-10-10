import { AllyComponent } from "../../../common/src/components/AllyComponent";
import { LocationComponent, LocationComponentLayers } from "../../../common/src/components/LocationComponent";
import { MovementComponent } from "../../../common/src/components/MovementComponent";
import { StatComponent } from "../../../common/src/components/StatComponent";
import { VisibilityComponent } from "../../../common/src/components/VisibilityComponent";
import { GameSystems } from "../../../common/src/models/Game";
import { ComponentSystem } from "../../../common/src/systems/ComponentSystem";
import { SpriteColors, SpriteNames } from "../../../common/src/types/Sprite";
import { BlockLayerName } from "../../../common/src/types/Tile";

export type ComponentBlock = {
    location?: LocationComponent;
    movement?: MovementComponent;
    visibility?: VisibilityComponent;
    ally?: AllyComponent;
    stats?: StatComponent;
}

export enum EntityType {
    player,
    bufonidWarrior,
    bufonidQueen,
    bufonidSpawn
}
export const baseEntities: Record<EntityType, () => ComponentBlock> = {
    [EntityType.player]: () => {
        return {
            location: {
                sprite: {
                    name: SpriteNames.player,
                    color: SpriteColors.beige
                },
                collidesWith: [BlockLayerName.character],
                collisionLayer: BlockLayerName.character,
                layer: LocationComponentLayers.character,
                location: { x: 0, y: 0}
            },
            ally: {group: 'players'},
            movement: { minMovementDelay: 30 },
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
            } as StatComponent
        };
    },
    [EntityType.bufonidWarrior]: () => {
        return {
            location: {
                sprite: {
                    name: SpriteNames.bufonid,
                    color: SpriteColors.green
                },
                collidesWith: [BlockLayerName.character],
                collisionLayer: BlockLayerName.character,
                layer: LocationComponentLayers.character,
                location: { x: 0, y: 0}
            },
            ally: {group: 'enemies'},
            movement: { minMovementDelay: 30 },
            visibility: { sightRadius: 6, visible: {} },
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
            } as StatComponent
        };
    },
    [EntityType.bufonidQueen]: () => {
        return {
            location: {
                sprite: {
                    name: SpriteNames.bufonid,
                    color: SpriteColors.red
                },
                collidesWith: [BlockLayerName.character],
                collisionLayer: BlockLayerName.character,
                layer: LocationComponentLayers.character,
                location: { x: 0, y: 0}
            },
            ally: {group: 'enemies'},
            movement: { minMovementDelay: 30 },
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
            } as StatComponent

        };
    },
    [EntityType.bufonidSpawn]: () => {
        return {
            location: {
                sprite: {
                    name: SpriteNames.spawn,
                    color: SpriteColors.cyan
                },
                collidesWith: [BlockLayerName.character],
                collisionLayer: BlockLayerName.character,
                layer: LocationComponentLayers.character,
                location: { x: 0, y: 0}
            },
            ally: {group: 'enemies'},
            movement: { minMovementDelay: 30 },
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
            } as StatComponent

        };
    },
};

export const SpawnEntity = (entityId: number, components: Record<string, any>, systems: GameSystems): void => {
    for(const system in components) {
        if(!(system in systems)) {
            throw new Error(`System does not exist: ${system}`);
        }

        // Add the component to the given system
        ((systems as any)[system] as ComponentSystem<any>).addComponentForEntity(entityId, components[system]);
    }
};
import { AllyComponent } from "../../../common/src/components/AllyComponent";
import { LocationComponent, LocationComponentLayers } from "../../../common/src/components/LocationComponent";
import { MovementComponent } from "../../../common/src/components/MovementComponent";
import { VisibilityComponent } from "../../../common/src/components/VisibilityComponent";
import { BlockLayers } from "../../../common/src/consts/TileDefinitions";
import { Dungeon } from "../../../common/src/models/Dungeon";
import { GameSystems } from "../../../common/src/models/Game";

/**
 * Takes an entity ID and adds all the necessary components to it
 * to make it the type specific in the function name.
 */

export const generatePlayerCharacter = (entityId: number, systems: GameSystems, dungeon: Dungeon): void => {
    const locationComponent = {
        sprite: {
            name: 'player',
            color: 'beige'
        },
        collidesWith: [BlockLayers.character],
        collisionLayer: BlockLayers.character,
        spawns: [1, 2],
        layer: LocationComponentLayers.character
    } as LocationComponent;

    systems.ally.addComponentForEntity(entityId, {group: 'players'} as AllyComponent);

    systems.location.spawnComponentForEntity(entityId, locationComponent, dungeon);

    systems.movement.addComponentForEntity(entityId, { minMovementDelay: 30 } as MovementComponent);

    systems.visibility.addComponentForEntity(entityId, { sightRadius: 5, visible: {} } as VisibilityComponent)

    systems.stats.addComponentForEntity(entityId, {
        current: {
            str: 10,
            con: 10,
            dex: 10
        },
        max: {
            str: 10,
            con: 10,
            dex: 10
        }
    });
};
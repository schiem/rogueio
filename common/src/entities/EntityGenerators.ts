import { LocationComponent, LocationComponentLayers } from "../components/LocationComponent";
import { MovementComponent } from "../components/MovementComponent";
import { BlockLayers } from "../consts/TileDefinitions";
import { Dungeon } from "../models/Dungeon";
import { GameSystems } from "../models/Game";

/**
 * Takes an entity ID and adds all the necessary components to it
 * to make it the type specific in the function name.
 */

export const generatePlayerCharacter = (entityId: number, systems: GameSystems, dungeon: Dungeon): void => {
    const locationComponent = {
        sprite: {
            name: 'player',
            color: 'brown'
        },
        collidesWith: [BlockLayers.character],
        collisionLayer: BlockLayers.character,
        spawns: [1, 2],
        layer: LocationComponentLayers.character
    } as LocationComponent;
    systems.location.spawnComponentForEntity(entityId, locationComponent, dungeon);

    systems.movement.addComponentForEntity(entityId, { minMovementDelay: 30 } as MovementComponent);
};
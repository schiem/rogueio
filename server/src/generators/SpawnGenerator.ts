import { LocationComponent } from "../../../common/src/components/LocationComponent";
import { EntityManager } from "../../../common/src/entities/EntityManager";
import { Dungeon } from "../../../common/src/models/Dungeon";
import { GameSystems } from "../../../common/src/models/Game";
import { Condition, Room } from "../../../common/src/models/Room";
import { RoomFeatureNames } from "../../../common/src/models/RoomFeatures";
import { Point } from "../../../common/src/types/Points";
import { random } from "../../../common/src/utils/MathUtils";
import { baseEntities, EntityType, SpawnEntity } from "./EntityGenerators";

export enum MobSpawnGeneratorName {
    bufonid
};

export type MobSpawnGenerator = {
    ageRange: {
        min: Condition,
        max: Condition 
    };

    spawnInFeatures: RoomFeatureNames[];

    doSpawn: (dungeon: Dungeon, room: Room, entityManager: EntityManager, systems: GameSystems) => void;
};

export const MobSpawnGenerators: Record<MobSpawnGeneratorName, MobSpawnGenerator> = {
    [MobSpawnGeneratorName.bufonid]: {
        ageRange: {
            min: 2,
            max: 4
        },
        spawnInFeatures: [RoomFeatureNames.water],
        doSpawn: (dungeon, room, entityManager, systems) => {
            const startPoint = room.features[RoomFeatureNames.water]?.originTile
            if (!startPoint) {
                return;
            }
            const spawns: Partial<Record<EntityType, number>> = {
                [EntityType.bufonidWarrior]: random(1, 5),
                [EntityType.bufonidSpawn]: random(0, 4),
                [EntityType.bufonidQueen]: random(0, 2),
            };

            let nextPoint: Point | undefined;

            for(const spawn in spawns) {
                const entitySpawn = spawn as unknown as EntityType;
                const numSpawns = spawns[entitySpawn] || 0;
                for(let i = 0; i < numSpawns; i++) {
                    const components = baseEntities[entitySpawn]();
                    const locationComponent = components.location as LocationComponent;
                    if (nextPoint === undefined) {
                        nextPoint = startPoint;
                    } else {
                        const surroundingTiles: Point[] = [];
                        [
                            {x: nextPoint.x - 1, y: nextPoint.y },
                            {x: nextPoint.x + 1, y: nextPoint.y },
                            {x: nextPoint.x, y: nextPoint.y - 1},
                            {x: nextPoint.x, y: nextPoint.y + 1 },
                        ].forEach((spreadPoint) => {
                            const tile = dungeon.tiles[spreadPoint.x]?.[spreadPoint.y];
                            // ensure that the tile exists, is not the current tile, is not blocked and does not contain water
                            if (!tile || dungeon.tileIsBlocked(spreadPoint, locationComponent.movesThrough)) { 
                                return;
                            }
                            surroundingTiles.push(spreadPoint);
                        });
                        if (!surroundingTiles.length) {
                            // No valid tiles to spawn around this point, stop trying for this mob
                            break;
                        }
                        nextPoint = surroundingTiles[random(0, surroundingTiles.length - 1)];
                    }
                    locationComponent.location = nextPoint;
                    const id = entityManager.addNextEntity();
                    SpawnEntity(id, components, systems);
                }
            }
        }
    }
}

export const SpawnPlayerCharacter = (entityId: number, systems: GameSystems, dungeon: Dungeon): void => {
    const components = baseEntities[EntityType.player]();
    let location: Point | undefined = undefined;
    const locationComponent = components.location as LocationComponent;

    // Find an appropriate spawn location
    while(location === undefined) {
        const roomsAvailable = dungeon.rooms.filter((room) => {
            return room.spawnTiles.length > 0 && room.age < 3;
        });
        if (roomsAvailable.length === 0) {
            return;
        }

        const maxTries = 4;
        let tries = 0;
        while(tries < maxTries && roomsAvailable.length > 0 && location === undefined) {
            tries++;
            const idx = random(0, roomsAvailable.length);
            const room = roomsAvailable[idx];
            const tiles = room.spawnTiles.filter((tile) => !dungeon.tileIsBlocked(tile, locationComponent.movesThrough));
            if (tiles.length) {
                location = tiles[random(0, tiles.length)];
            }
        }
    }
    locationComponent.location = location;
    SpawnEntity(entityId, components, systems);
}
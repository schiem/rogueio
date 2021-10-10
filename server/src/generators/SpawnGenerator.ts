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
            const numBufonidSpawn = 1; //random(0, 3);
            //const numQueens = random(0, 1);
            //const numWarriors = random(1, 4);

            let nextSpawnPoint = startPoint;
            for(let i = 0; i < numBufonidSpawn; i++) {
                const components = baseEntities[EntityType.bufonidSpawn]();
                const locationComponent = components.location as LocationComponent;
                locationComponent.location = nextSpawnPoint;
                const id = entityManager.addNextEntity();
                SpawnEntity(id, components, systems);
            }

            /*
            for(let i = 0; i < numWarriors; i++) {
                const components = baseEntities[EntityType.bufonidWarrior]();
                const locationComponent = components.location as LocationComponent;
                locationComponent.location = startPoint;
                const id = entityManager.addNextEntity();
                SpawnEntity(id, components, systems);
            }

            for(let i = 0; i < numQueens; i++) {
                const components = baseEntities[EntityType.bufonidQueen]();
                const locationComponent = components.location as LocationComponent;
                locationComponent.location = startPoint;
                const id = entityManager.addNextEntity();
                SpawnEntity(id, components, systems);
            }
            */

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
            const tiles = room.spawnTiles.filter((tile) => !dungeon.tileIsBlocked(tile, locationComponent.collisionLayer));
            if (tiles.length) {
                location = tiles[random(0, tiles.length)];
            }
        }
    }
    locationComponent.location = location;
    SpawnEntity(entityId, components, systems);
}
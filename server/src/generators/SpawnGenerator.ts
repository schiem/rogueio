import { LocationComponent } from "../../../common/src/components/LocationComponent";
import { Dungeon } from "../../../common/src/models/Dungeon";
import { GameSystems } from "../../../common/src/models/Game";
import { Room } from "../../../common/src/models/Room";
import { RoomFeatureNames } from "../../../common/src/models/RoomFeatures";
import { Point } from "../../../common/src/types/Points";
import { random } from "../../../common/src/utils/MathUtils";
import { baseEntities, EntityType, SpawnEntity } from "./EntityGenerators";

export enum MobSpawnGeneratorNames {
    bufonid
};

export type MobSpawnGenerator = {
    ageRange: {
        min: number,
        max: number
    };

    spawnInFeatures: RoomFeatureNames[];

    doSpawn: (dungeon: Dungeon, room: Room) => void;
};

export const MobSpawnGenerators: Record<MobSpawnGeneratorNames, MobSpawnGenerator> = {
    [MobSpawnGeneratorNames.bufonid]: {
        ageRange: {
            min: 2,
            max: 4
        },
        spawnInFeatures: [RoomFeatureNames.water],
        doSpawn: (dungeon, room) => {
            const startPoint = room.features[RoomFeatureNames.water]?.originTile
            if (!startPoint) {
                return;
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
            const tiles = room.spawnTiles.filter((tile) => !dungeon.tileIsBlocked(tile, locationComponent.collisionLayer));
            if (tiles.length) {
                location = tiles[random(0, tiles.length)];
            }
        }
    }
    locationComponent.location = location;
    SpawnEntity(entityId, components, systems);
}
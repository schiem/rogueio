import { CharacterType } from "../../../common/src/components/DescriptionComponent";
import { LocationComponent } from "../../../common/src/components/LocationComponent";
import { GameSystems } from "../../../common/src/models/Game";
import { Point } from "../../../common/src/types/Points";
import { random } from "../../../common/src/utils/MathUtils";
import { ServerDungeon } from "../models/ServerDungeon";
import { mobEntities, SpawnEntity } from "./EntityGenerators";

export const SpawnPlayerCharacter = (entityId: number, systems: GameSystems, dungeon: ServerDungeon): void => {
    const components = mobEntities[CharacterType.player]();
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
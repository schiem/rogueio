import { CharacterType } from "../../../../common/src/components/DescriptionComponent";
import { LocationComponent } from "../../../../common/src/components/LocationComponent";
import { Point } from "../../../../common/src/types/Points";
import { random } from "../../../../common/src/utils/MathUtils";
import { RoomFeature } from "../../models/RoomFeatures";
import { mobEntities, SpawnEntity } from "../EntityGenerators";
import { Spawner } from "../Spawner";

export const BufonidSpawner: Spawner = {
    requires: [RoomFeature.water],
    doSpawn: (room, dungeon, entityManager, systems) => {
        const startPoint = room.features[RoomFeature.water];
        if (!startPoint) {
            return;
        }
        const spawns: Partial<Record<CharacterType, number>> = {
            [CharacterType.bufonidWarrior]: random(1, 5),
            [CharacterType.bufonidSpawn]: random(0, 4),
            [CharacterType.bufonidQueen]: random(0, 2),
        };

        let nextPoint: Point | undefined;

        for (const spawn in spawns) {
            const entitySpawn = spawn as unknown as CharacterType;
            const numSpawns = spawns[entitySpawn] || 0;
            for (let i = 0; i < numSpawns; i++) {
                const components = mobEntities[entitySpawn]();
                const locationComponent = components.location as LocationComponent;
                if (nextPoint === undefined) {
                    nextPoint = startPoint;
                } else {
                    const surroundingTiles: Point[] = [];
                    [
                        { x: nextPoint.x - 1, y: nextPoint.y },
                        { x: nextPoint.x + 1, y: nextPoint.y },
                        { x: nextPoint.x, y: nextPoint.y - 1 },
                        { x: nextPoint.x, y: nextPoint.y + 1 },
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
};
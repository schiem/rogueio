import { Dungeon } from "../../../../common/src/models/Dungeon";
import { Point } from "../../../../common/src/types/Points";
import { MovementType, TileModifier } from "../../../../common/src/types/Tile";
import { random } from "../../../../common/src/utils/MathUtils";
import { Room } from "../../models/Room";
import { RoomFeature } from "../../models/RoomFeatures";

export const WaterSpawner = (room: Room, dungeon: Dungeon): boolean => {
    const maxTries = 4;
    let tries = 0;
    let tileToAdd: Point | undefined = undefined;
    while(tileToAdd === undefined && tries < maxTries) {
        tries++;
        const attemptTile = room.getRandomTile();
        if(!dungeon.tileIsBlocked(attemptTile, [MovementType.land])) {
            tileToAdd = attemptTile;
        }
    }

    // Ran out of tries, couldn't add water
    if (!tileToAdd) {
        return false;
    }

    const amountOfWater = random(13, 24);
    room.features[RoomFeature.water] = tileToAdd;
    setWaterModifier(tileToAdd, amountOfWater, dungeon);
    spreadWater(tileToAdd, amountOfWater, dungeon);

    return true;
}

const spreadWater = (point: Point, waterAmount: number, dungeon: Dungeon, depth = 0): void => {
    // Bail after a certain amount, no matter what
    if (depth > 8) {
        return;
    }

    const surroundingTiles: Point[] = [];
    [
        {x: point.x - 1, y: point.y },
        {x: point.x + 1, y: point.y },
        {x: point.x, y: point.y - 1},
        {x: point.x, y: point.y + 1 },
    ].forEach((spreadPoint) => {
        const tile = dungeon.tiles[spreadPoint.x]?.[spreadPoint.y];
        // ensure that the tile exists, is not the current tile, is not blocked and does not contain water
        if (!tile || dungeon.tileIsBlocked(spreadPoint, [MovementType.land])) { 
            return;
        }
        surroundingTiles.push(spreadPoint);
    });
    const avgWater = surroundingTiles.length ? Math.round(waterAmount / surroundingTiles.length) : 0;
    // Only spread to tiles that have at least two squares
    if (avgWater > 1) {
        surroundingTiles.forEach((tile) => {
            setWaterModifier(tile, avgWater, dungeon);
        });
        // Do this twice so all the tiles have their water set before recursing into them
        surroundingTiles.forEach((tile) => {
            spreadWater(tile, avgWater, dungeon, depth + 1);
        });
    }
}

const setWaterModifier = (point: Point, amount: number, dungeon: Dungeon): void => {
    const tile = dungeon.tiles[point.x]?.[point.y];
    if (!tile || amount === 0) {
        return;
    }

    if (amount > 3) {
        tile.mods.push(TileModifier.deepWater);
    } else {
        tile.mods.push(TileModifier.shallowWater);
    }
}
import { Dungeon } from "../../../common/src/models/Dungeon";
import { TileName } from "../../../common/src/types/Tile";
import { Room } from "./Room";

export enum RoomType {
    active = 1,
    abandoned,
    natural
}

export const RoomToTypeConverters: Record<RoomType, (room: Room, dungeon: Dungeon) => void>  = {
    [RoomType.active]: (room, dungeon) => {
        // Do nothing for active rooms
        return;
    },
    [RoomType.abandoned]: (room, dungeon) => {
        randomlyScatter(room, dungeon, TileName.constructedRubble, 0.2);
    },
    [RoomType.natural]: (room, dungeon) => {
        randomlyScatter(room, dungeon, TileName.naturalRubble, 0.5);
        for (let i = 0; i < 2; i++) {
            for(let x = room.rect.topLeft.x; x < room.rect.bottomRight.x; x++) {
                for(let y = room.rect.topLeft.y; y < room.rect.bottomRight.y; y++) {
                    runCellularAutomata(x, y, dungeon, TileName.naturalRubble);
                }
            }
        }
    }
}

export const randomlyScatter = (room: Room, dungeon: Dungeon, tile: TileName, weight: number): void => {
    const bottomRight = room.rect.bottomRight;
    for(let x = room.rect.topLeft.x; x < bottomRight.x; x++) {
        for(let y = room.rect.topLeft.y; y < bottomRight.y; y++) {
            if(Math.random() < weight) {
                dungeon.tiles[x][y].definition = tile;
            }
        }
    }
}

export const runCellularAutomata = (x: number, y: number, dungeon: Dungeon, tile: TileName, unsetTile?: TileName): void => {
    let neighborCount = 0;
    for(let newX = x - 1; newX <= x + 1; newX++) {
        for(let newY = y - 1; newY <= y + 1; newY++) {
            if (
                (newX === x && newY === y) 
                || dungeon.tiles[newX] === undefined
                || dungeon.tiles[newX][newY] === undefined
                || dungeon.tiles[newX][newY].definition === undefined
            ) {
                continue;
            }
            neighborCount++;
        }
    }
    dungeon.tiles[x][y].definition = neighborCount > 4 ? tile : unsetTile;
}
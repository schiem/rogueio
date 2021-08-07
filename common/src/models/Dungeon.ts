import { Tile } from "../types/Tile";
import { Point } from "../types/Points";
import { Room } from "./Room";
import { TileDefinitions } from "../consts/TileDefinitions";

export class Dungeon {
    tiles: Tile[][] = [];

    rooms: Room[] = [];
    connections: [number, number][] = [];

    constructor(public size: Point) {
    }

    /**
     * Check whether a tile at a location blocks the given block layer.
     */
    tileIsBlocked(point: Point, blockLayer: number): boolean {
        const tile = this.tiles[point.x][point.y];
        if (tile.definition === undefined) {
            return false;
        }
        const def = TileDefinitions[tile.definition];
        return def.blocks.indexOf(blockLayer) === -1;
    }
}

import { Tile } from "../types/Tile";
import { Point } from "../types/Points";
import { Room } from "./Room";
import { TileDefinitions } from "../consts/TileDefinitions";

export class Dungeon {
    tiles: Tile[][] = [];

    rooms: Room[] = [];
    connections: [number, number][] = [];

    constructor(public size: Point) {}

    setTile(tile: Tile): void {
        if (!this.tiles[tile.coords.x]) {
            this.tiles[tile.coords.x] = new Array(this.size.y);
        }
        this.tiles[tile.coords.x][tile.coords.y] = tile;
    }

    tileBlocksVision(point: Point): boolean {
        const tile = this.tiles[point.x][point.y];
        if (!tile) {
            // no tile, probably outside the map
            return true;
        }
        if (tile.definition === undefined) {
            // nothing at this tile, can't block vision
            return false;
        }
        return TileDefinitions[tile.definition].blocksVision;
    }

    /**
     * Check whether a tile at a location blocks the given block layer.
     */
    tileIsBlocked(point: Point, blockLayer: number): boolean {
        const tile = this.tiles[point.x][point.y];
        if (!tile) {
            return true;
        }

        if (tile.definition === undefined) {
            return false;
        }
        const def = TileDefinitions[tile.definition];
        return def.blocks.indexOf(blockLayer) !== -1;
    }

    hasOpenTileAround(point: Point): boolean {
        for(let x = point.x - 1; x <= point.x + 1; x++) {
            for(let y = point.y - 1; y <= point.y + 1; y++) {
                if (this.tiles[x]?.[y]?.definition === undefined) {
                    return true;
                }
            }
        }

        return false;
    }
}

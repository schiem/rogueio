import { Tile, TileModifier } from "../types/Tile";
import { Point } from "../types/Points";
import { Room } from "./Room";
import { ModDefinitions, TileDefinitions } from "../consts/TileDefinitions";
import { TileDefinition } from "../types/TileDefinition";

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

    /**
     * Get a tile definition, or undefined if the tile has no definition.
     * Returns null if the tile does not exist.
     */
    getTileDefinition(point: Point): TileDefinition | undefined | null {
        const tile = this.tiles[point.x]?.[point.y];
        if (!tile) {
            return null;
        }

        if (tile.mods.length) {
            const mod: TileModifier = Math.max.apply(tile.mods);
            return ModDefinitions[mod];
        }

        const def = tile?.definition;
        if (!def) {
            return;
        }
        return TileDefinitions[def];
    }

    tileBlocksVision(point: Point): boolean {
        const def = this.getTileDefinition(point);
        if (def === null) {
            // no tile, probably outside the map
            return true;
        }
        if (def === undefined) {
            // nothing at this tile, can't block vision
            return false;
        }
        return def.blocksVision;
    }

    /**
     * Check whether a tile at a location blocks the given block layer.
     */
    tileIsBlocked(point: Point, blockLayer: number): boolean {
        const def = this.getTileDefinition(point);
        if (def === null) {
            // no tile, probably outside the map
            return true;
        }

        if (def === undefined) {
            return false;
        }
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

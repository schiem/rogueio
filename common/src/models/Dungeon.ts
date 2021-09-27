import { Tile } from "../types/Tile";
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
     * Get all the defs for a tile, or undefined if the tile does not exist.
     */
    getAllTileDefinition(point: Point): TileDefinition[] | undefined {
        const definitions: TileDefinition[] = [];
        const tile = this.tiles[point.x]?.[point.y];
        if (!tile) {
            return;
        }

        if (tile.definition) {
            definitions.push(TileDefinitions[tile.definition]);
        }
        tile.mods.forEach((mod) => {
            definitions.push(ModDefinitions[mod]);
        });
        return definitions;
    }

    tileBlocksVision(point: Point): boolean {
        const defs = this.getAllTileDefinition(point);
        if (defs === undefined) {
            // no tile, probably outside the map
            return true;
        }
        return defs.find((def) => {
            return def.blocksVision;
        }) !== undefined;
    }

    /**
     * Check whether a tile at a location blocks the given block layer.
     */
    tileIsBlocked(point: Point, blockLayer?: number): boolean {
        const defs = this.getAllTileDefinition(point);
        if (defs === undefined) {
            // no tile, probably outside the map
            return true;
        }

        if (blockLayer) {
            // Check if the tile blocks a specific layer.
            return defs.find((def) => {
                return def.blocks.indexOf(blockLayer) !== -1;
            }) !== undefined;
        } else {
            // Check if the tile blocks anything
            return defs.find((def) => {
                return def.blocks.length > 0;
            }) !== undefined;
        }
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

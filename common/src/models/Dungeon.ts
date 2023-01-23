import { MovementType, Tile, TileModifier, TileName } from "../types/Tile";
import { Point } from "../types/Points";
import { ModDefinitions, TileDefinitions } from "../consts/TileDefinitions";
import { TileDefinition } from "../types/TileDefinition";
import { ArrayMax } from "../utils/ArrayUtils";

export class Dungeon {
    tiles: Tile[][] = [];

    connections: [number, number][] = [];

    constructor(public size: Point) {}

    setTile(tile: Tile, location: Point): void {
        if (!this.tiles[location.x]) {
            this.tiles[location.x] = new Array(this.size.y);
        }
        this.tiles[location.x][location.y] = tile;
    }

    /**
     * Get the highest tile definition of a tile.
     * Returns a tiledefinition, undefined if the tile has no definition, or null if the tile doesn't exist.
     */
    getVisibleTileDefinition(point: Point): TileDefinition | undefined {
        const tile = this.tiles[point.x]?.[point.y];
        if (!tile) {
            return;
        }

        if (tile.mods.length) {
            const mod = ArrayMax(tile.mods) as TileModifier;
            return ModDefinitions[mod];
        }
        return tile.definition ? TileDefinitions[tile.definition] : TileDefinitions[TileName.floor];
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
        } else {
            definitions.push(TileDefinitions[TileName.floor]);
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
    tileIsBlocked(point: Point, moveType: MovementType[]): boolean {
        const def = this.getVisibleTileDefinition(point);
        if (def === undefined) {
            // no tile, probably outside the map
            return true;
        }

        // check to make sure that at least one of the components
        // movement types is in the tile
        return moveType.find((type) => {
            return def.movement.indexOf(type) !== -1;
        }) === undefined;
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

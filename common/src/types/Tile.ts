import { TileDefinition } from "./TileDefinition";
import { Point } from "./Points";

export type Tile = {
    coords: Point;
    definition?: TileDefinition;
    seen: boolean;
    visible: boolean;
}

export class TileFactory {
    public static generateTile(coords: Point, tileDef?: TileDefinition): Tile {
        return {
            coords,
            definition: tileDef,
            seen: false,
            visible: false
        };
    }
}
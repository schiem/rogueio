import { TileDefinition } from "./TileDefinition";
import { Point } from "./Points";

export type Tile = {
    coords: Point;
    definition: TileDefinition;
    seen: boolean;
    visible: boolean;
}

export class TileFactory {
    public static generateTile(tileDef: TileDefinition, coords: Point): Tile {
        return {
            coords,
            definition: tileDef,
            seen: false,
            visible: false
        };
    }
}
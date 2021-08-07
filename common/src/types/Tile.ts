import { Point } from "./Points";

export type Tile = {
    coords: Point;
    // store a string reference to the definition - look it up when needed
    definition?: string;
    seen: boolean;
    visible: boolean;
}

export class TileFactory {
    public static generateTile(coords: Point, tileDef?: string): Tile {
        return {
            coords,
            definition: tileDef,
            seen: false,
            visible: false
        };
    }
}
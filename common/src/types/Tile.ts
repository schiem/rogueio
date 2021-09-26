import { Point } from "./Points";

export enum TileModifier {
    shallowWater,
    deepWater
};

export type Tile = {
    coords: Point;
    // store a string reference to the definition - look it up when needed
    definition?: string;

    mods: TileModifier[];
}
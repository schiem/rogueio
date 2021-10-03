import { Point } from "./Points";

export enum BlockLayerName {
    character = 1,
    item
}

export enum TileName {
    wall = 1,
    rubble,
    floor
}

export enum TileModifier {
    shallowWater,
    deepWater
};

export type Tile = {
    coords: Point;
    // store a string reference to the definition - look it up when needed
    definition?: TileName;

    mods: TileModifier[];
}
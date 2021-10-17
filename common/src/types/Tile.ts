import { Point } from "./Points";

export enum MovementType {
    land = 1,
    water
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
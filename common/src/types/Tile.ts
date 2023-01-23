export enum MovementType {
    land = 1,
    water
}

export enum TileName {
    wall = 1,
    floor,
    constructedRubble,
    naturalRubble,
}

export enum TileModifier {
    shallowWater,
    deepWater
};

export type Tile = {
    // store a string reference to the definition - look it up when needed
    definition?: TileName;

    mods: TileModifier[];
}
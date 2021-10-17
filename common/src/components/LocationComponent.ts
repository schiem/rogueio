import { Point } from "../types/Points";
import { Sprite } from "../types/Sprite";
import { MovementType } from "../types/Tile";

export const LocationComponentLayers = {
    item: 1,
    character: 2 
}

export type LocationComponent = {
    sprite: Sprite;
    movesThrough: MovementType[];
    location: Point;
    layer: number;
};

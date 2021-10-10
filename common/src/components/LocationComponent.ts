import { Point } from "../types/Points";
import { Sprite } from "../types/Sprite";

export const LocationComponentLayers = {
    item: 1,
    character: 2 
}

export type LocationComponent = {
    sprite: Sprite;
    collidesWith: number[];
    collisionLayer: number;
    location: Point;
    layer: number;
};

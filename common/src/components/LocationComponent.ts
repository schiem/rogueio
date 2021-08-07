import { Condition } from "../models/Room";
import { Point } from "../types/Points";

export const LocationComponentLayers = {
    item: 1,
    character: 2 
}

export type LocationComponent = {
    spriteName: string;
    collidesWith: number[];
    collisionLayer: number;
    location: Point;
    spawns: Condition[];
    layer: number;
};

import { Point } from "../types/Points";
import { Sprite } from "../types/Sprite";
import { BlockLayerName } from "../types/Tile";

export const LocationComponentLayers = {
    item: 1,
    character: 2 
}

export type LocationComponent = {
    sprite: Sprite;
    collidesWith: BlockLayerName[];
    collisionLayer: BlockLayerName;
    location: Point;
    layer: number;
};

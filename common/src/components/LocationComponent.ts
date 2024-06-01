import { Point } from "../types/Points";
import { MovementType } from "../types/Tile";

export enum LocationComponentLayer {
    item = 1 << 0,
    character = 1 << 1
}

export const layerCollisions: Record<LocationComponentLayer, number> = {
    [LocationComponentLayer.item]: 0,
    [LocationComponentLayer.character]: LocationComponentLayer.character
}

export type LocationComponent = {
    movesThrough: MovementType[];
    location?: Point;
    layer: LocationComponentLayer;
};

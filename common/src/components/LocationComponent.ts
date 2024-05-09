import { Point } from "../types/Points";
import { MovementType } from "../types/Tile";

export enum LocationComponentLayer {
    item = 1,
    character
}

export type LocationComponent = {
    movesThrough: MovementType[];
    location?: Point;
    layer: LocationComponentLayer;
};

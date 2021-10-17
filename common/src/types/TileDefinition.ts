import { Sprite } from "./Sprite";
import { MovementType } from "./Tile";

export type TileDefinition = {
    movement: MovementType[];
    blocksVision: boolean;
    sprite: Sprite 
}
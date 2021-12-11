import { Sprite } from "./Sprite";
import { MovementType } from "./Tile";

export type TileDefinition = {
    name: string;
    movement: MovementType[];
    blocksVision: boolean;
    sprite: Sprite 
}
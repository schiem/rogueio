import { Sprite } from "./Sprite";
import { BlockLayerName } from "./Tile";

export type TileDefinition = {
    blocks: BlockLayerName[];
    blocksVision: boolean;
    sprite: Sprite 
}
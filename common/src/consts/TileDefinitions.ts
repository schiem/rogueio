import { BlockLayerName, TileModifier, TileName } from "../types/Tile";
import { TileDefinition } from "../types/TileDefinition";

export const ModDefinitions: Record<TileModifier, TileDefinition> = {
    [TileModifier.shallowWater]: { blocks: [], sprite: { name: 'water', color: 'cyan' }, blocksVision: false },
    [TileModifier.deepWater]: { blocks: [BlockLayerName.character], sprite: { name: 'water', color: 'blue' }, blocksVision: false }
};

export const TileDefinitions: Record<TileName, TileDefinition> = {
    [TileName.wall]: { blocks: [BlockLayerName.character, BlockLayerName.item], sprite: { name: 'wall', color: 'default' }, blocksVision: true },
    [TileName.rubble]: { blocks: [BlockLayerName.character, BlockLayerName.item], sprite: { name: 'rubble', color: 'brown' }, blocksVision: true },
    [TileName.floor]: { blocks: [], sprite: { name: 'floor', color: 'default' }, blocksVision: false },
};

import { SpriteNames, SpriteColors } from "../types/Sprite";
import { BlockLayerName, TileModifier, TileName } from "../types/Tile";
import { TileDefinition } from "../types/TileDefinition";

export const ModDefinitions: Record<TileModifier, TileDefinition> = {
    [TileModifier.shallowWater]: { blocks: [], sprite: { name: SpriteNames.water, color: SpriteColors.cyan }, blocksVision: false },
    [TileModifier.deepWater]: { blocks: [BlockLayerName.character], sprite: { name: SpriteNames.water, color: SpriteColors.blue }, blocksVision: false }
};

export const TileDefinitions: Record<TileName, TileDefinition> = {
    [TileName.wall]: { blocks: [BlockLayerName.character, BlockLayerName.item], sprite: { name: SpriteNames.wall, color: SpriteColors.default }, blocksVision: true },
    [TileName.rubble]: { blocks: [BlockLayerName.character, BlockLayerName.item], sprite: { name: SpriteNames.rubble, color: SpriteColors.brown }, blocksVision: true },
    [TileName.floor]: { blocks: [], sprite: { name: SpriteNames.floor, color: SpriteColors.default }, blocksVision: false },
};

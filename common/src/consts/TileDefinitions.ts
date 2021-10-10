import { SpriteName, SpriteColor } from "../types/Sprite";
import { BlockLayerName, TileModifier, TileName } from "../types/Tile";
import { TileDefinition } from "../types/TileDefinition";

export const ModDefinitions: Record<TileModifier, TileDefinition> = {
    [TileModifier.shallowWater]: { blocks: [], sprite: { name: SpriteName.water, color: SpriteColor.cyan }, blocksVision: false },
    [TileModifier.deepWater]: { blocks: [BlockLayerName.character], sprite: { name: SpriteName.water, color: SpriteColor.blue }, blocksVision: false }
};

export const TileDefinitions: Record<TileName, TileDefinition> = {
    [TileName.wall]: { blocks: [BlockLayerName.character, BlockLayerName.item], sprite: { name: SpriteName.wall, color: SpriteColor.default }, blocksVision: true },
    [TileName.rubble]: { blocks: [BlockLayerName.character, BlockLayerName.item], sprite: { name: SpriteName.rubble, color: SpriteColor.brown }, blocksVision: true },
    [TileName.floor]: { blocks: [], sprite: { name: SpriteName.floor, color: SpriteColor.default }, blocksVision: false },
};

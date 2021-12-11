import { SpriteName, SpriteColor } from "../types/Sprite";
import { MovementType, TileModifier, TileName } from "../types/Tile";
import { TileDefinition } from "../types/TileDefinition";

export const ModDefinitions: Record<TileModifier, TileDefinition> = {
    [TileModifier.shallowWater]: { name: 'shallowWater', movement: [MovementType.land, MovementType.water], sprite: { name: SpriteName.water, color: SpriteColor.cyan }, blocksVision: false },
    [TileModifier.deepWater]: { name: 'deepWater', movement: [MovementType.water], sprite: { name: SpriteName.water, color: SpriteColor.blue }, blocksVision: false }
};

export const TileDefinitions: Record<TileName, TileDefinition> = {
    [TileName.wall]: { name: 'wall', movement: [], sprite: { name: SpriteName.wall, color: SpriteColor.default }, blocksVision: true },
    [TileName.rubble]: { name: 'rubble', movement: [], sprite: { name: SpriteName.rubble, color: SpriteColor.brown }, blocksVision: true },
    [TileName.floor]: { name: 'floor', movement: [MovementType.land], sprite: { name: SpriteName.floor, color: SpriteColor.default }, blocksVision: false },
};

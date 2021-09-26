import { TileModifier } from "../types/Tile";
import { TileDefinition } from "../types/TileDefinition";

export const BlockLayers = {
    character: 1,
    item: 2
}

export const ModDefinitions: Record<TileModifier, TileDefinition> = {
    [TileModifier.shallowWater]: { blocks: [], sprite: {name: 'water', color: 'cyan'}, blocksVision: false},
    [TileModifier.deepWater]: { blocks: [BlockLayers.character], sprite: {name: 'water', color: 'blue'}, blocksVision: false}
};

export const TileDefinitions: Record<string, TileDefinition> = {
    wall: {blocks: [BlockLayers.character, BlockLayers.item], sprite: { name: 'wall', color: 'default'}, blocksVision: true},
    rubble: {blocks: [BlockLayers.character, BlockLayers.item], sprite: {name: 'rubble', color: 'brown'}, blocksVision: true},
    floor: {blocks: [], sprite: { name: 'floor', color: 'default'}, blocksVision: false},
};

import { TileDefinition } from "../types/TileDefinition";

export const BlockLayers = {
    character: 1,
    item: 2
}

export const TileDefinitions: Record<string, TileDefinition> = {
    wall: {blocks: [BlockLayers.character, BlockLayers.item], spriteName: 'wall'},
};

export type TileDefinition = {
    blocks: BlockLayer[];
    spriteName: string
}

export type BlockLayer = 'character' | 'item';
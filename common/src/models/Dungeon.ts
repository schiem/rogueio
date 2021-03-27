import { Item } from "./Item";

import { Character } from "./Character";
import { Tile } from "../types/Tile";
import { tileDefinitions } from "../consts/TileDefinitions";

export class Dungeon {
    items: Item[] = [];
    characters: Character[] = [];
    tiles: (Tile | undefined)[][];

    constructor(tiles: (Tile | undefined)[][]) {
        this.tiles = tiles;
    }
}

export const generateDungeon = (width: number, height: number): Dungeon => {
    const wallTile = tileDefinitions.wall;
    const tiles = new Array(width);
    for(let i = 0; i < width; i++) {
        tiles[i] = new Array(height);
    }

    //Dungeon generation happens here

    return new Dungeon(tiles);
}
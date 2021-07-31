import { Item } from "./Item";

import { Character } from "./Character";
import { Tile } from "../types/Tile";
import { Point } from "../types/Points";
import { Room } from "./Room";
import { BlockLayer } from "../types/TileDefinition";

export class Dungeon {
    items: Item[] = [];
    characters: Record<number, Record<number, Character>> = {};
    tiles: Tile[][] = [];
    rooms: Room[] = [];
    connections: [number, number][] = [];

    constructor(public size: Point) {
    }

    tileIsBlocked(point: Point, blockLayer: BlockLayer): boolean {
        if (blockLayer === 'character') {
            // characters are blocked by other characters
            if (this.characters[point.x] && this.characters[point.x][point.y]) {
                return true;
            }
        }

        return this.tiles[point.x][point.y].definition === undefined || this.tiles[point.x][point.y].definition?.blocks.indexOf(blockLayer) === -1;
    }

    addCharacterAt(character: Character, point: Point): void {
        if (!this.characters[point.x]) {
            this.characters[point.x] = {};
        }
        this.characters[point.x][point.y] = character;
    }


    removeCharacterAt(point: Point): void {
        if (this.characters[point.x] && this.characters[point.x][point.y]) {
            delete this.characters[point.x][point.y];
        }
    }
}

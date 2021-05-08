import { Item } from "./Item";

import { Character } from "./Character";
import { Tile } from "../types/Tile";
import { Point } from "../types/Points";
import { Room } from "./Room";

export class Dungeon {
    items: Item[] = [];
    characters: Character[] = [];
    tiles: Tile[][] = [];
    rooms: Room[] = [];
    connections: [number, number][] = [];

    constructor(public size: Point) {
    }
}

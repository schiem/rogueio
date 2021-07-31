import { Rectangle } from "./Rectangle";
import { Point } from "../types/Points";

export type Condition = 1 | 2 | 3 | 4;
export class Room {
    // A list of the indices of other rooms in the dungeon that this room is connected to
    connections: number[] = [];

    spawnTiles: Point[] = [];
    maxSpawnTiles = 6;

    age: Condition;

    constructor(public rect: Rectangle) {
        this.age = 1;
    }

    id(): string {
        return `${this.rect.location.x}-${this.rect.location.y}`;
    }
}
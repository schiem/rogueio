import { Rectangle } from "./Rectangle";
import { Point } from "../types/Points";
import { random } from "../utils/MathUtils";
import { RoomFeatures } from "./RoomFeatures";

export type Condition = 1 | 2 | 3 | 4;
export class Room {
    // A list of the indices of other rooms in the dungeon that this room is connected to
    connections: number[] = [];

    spawnTiles: Point[] = [];
    maxSpawnTiles = 6;

    age: Condition;
    features: RoomFeatures = {};

    constructor(public rect: Rectangle) {
        this.age = 1;
    }

    getRandomTile(): Point {
        return {x: random(this.rect.topLeft.x, this.rect.bottomRight.x), y: random(this.rect.topLeft.y, this.rect.bottomRight.y)};
    }

    id(): string {
        return `${this.rect.location.x}-${this.rect.location.y}`;
    }
}
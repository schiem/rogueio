import { Rectangle } from "../../../common/src/models/Rectangle";
import { RoomFeatures } from "./RoomFeatures";
import { Point } from "../../../common/src/types/Points";
import { random } from "../../../common/src/utils/MathUtils";
import { Spawner } from "../generators/Spawner";

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

    spawnerIsValid(spawner: Spawner): boolean {
        if (this.age < spawner.ageRange.min || this.age > spawner.ageRange.max) {
            return false;
        }

        const hasFeature = spawner.spawnInFeatures.some((feature) => {
            return feature in this.features;
        });
        return spawner.spawnInFeatures.length === 0 || hasFeature;
    }

    id(): string {
        return `${this.rect.location.x}-${this.rect.location.y}`;
    }
}
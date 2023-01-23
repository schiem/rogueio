import { Rectangle } from "../../../common/src/models/Rectangle";
import { Point } from "../../../common/src/types/Points";
import { random } from "../../../common/src/utils/MathUtils";
import { RoomFeature } from "./RoomFeatures";
import { RoomType } from "./RoomType";

export class Room {
    // A list of the indices of other rooms in the dungeon that this room is connected to
    connections: number[] = [];

    type: RoomType;
    features: Partial<Record<RoomFeature, Point>> = {};
    spawnTiles: Point[] = [];
    maxSpawnTiles = 6;

    constructor(public rect: Rectangle) {
        this.type = RoomType.active;
    }

    getRandomTile(): Point {
        return {x: random(this.rect.topLeft.x, this.rect.bottomRight.x), y: random(this.rect.topLeft.y, this.rect.bottomRight.y)};
    }

    id(): string {
        return `${this.rect.location.x}-${this.rect.location.y}`;
    }
}
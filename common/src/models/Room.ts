import { Rectangle } from "./Rectangle";

export type Condition = 1 | 2 | 3 | 4;
export class Room {
    connections: number[] = [];
    age: Condition;

    constructor(public rect: Rectangle) {
        this.age = 1;
    }

    id(): string {
        return `${this.rect.location.x}-${this.rect.location.y}`;
    }
}
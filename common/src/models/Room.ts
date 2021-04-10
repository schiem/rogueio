import { Rectangle } from "./Rectangle";

export class Room {
    connections: Room[] = [];

    constructor(public rect: Rectangle) {}
}
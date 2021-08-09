import { Point } from "../../types/Points";
import { ClientEvent, ClientEventType } from "./ClientEvent";

export type MoveData = { direction: Point };

export class MoveEvent extends ClientEvent {
    type = ClientEventType.move;
    data: MoveData;

    constructor(direction: Point) {
        super();
        this.data = {
            direction
        };
    }
}
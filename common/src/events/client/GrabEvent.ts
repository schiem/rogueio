import { ClientEvent, ClientEventType } from "./ClientEvent";

export type GrabData = {
    target: number;
}

export class GrabEvent extends ClientEvent {
    type = ClientEventType.grab;
    data: GrabData;

    constructor(target: number) {
        super();
        this.data = {
            target
        };
    }
}
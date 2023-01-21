import { ClientEvent, ClientEventType } from "./ClientEvent";

export type DropData = {
    target: number;
}

export class DropEvent extends ClientEvent {
    type = ClientEventType.drop;
    data: DropData;

    constructor(target: number) {
        super();
        this.data = {
            target
        };
    }
}
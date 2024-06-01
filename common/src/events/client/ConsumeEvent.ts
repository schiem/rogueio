import { ClientEvent, ClientEventType } from "./ClientEvent";

export type ConsumeData = {
    target: number
}

export class ConsumeEvent extends ClientEvent {
    type = ClientEventType.consume;
    data: ConsumeData;

    constructor(target: number) {
        super();
        this.data = {
            target
        };
    }
}
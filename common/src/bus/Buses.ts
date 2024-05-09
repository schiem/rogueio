import { EventEmitter } from "../events/EventEmitter";

export type MessageData = {
    message: string;
    replacements?: (string | number)[];
    entities: number[]
}

export class Bus {
    static messageEmitter = new EventEmitter<MessageData>();
}
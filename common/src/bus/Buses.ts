import { EventEmitter } from "../events/EventEmitter";

export type MessageData = {
    message: string;
    replacements?: (string | Promise<string>)[];
    entities: number[]
}

export class Bus {
    static messageEmitter = new EventEmitter<MessageData>();
}
import { ServerEvent, ServerEventType } from "./ServerEvent";

export type MessageData = {message: string, replacements?: string[]};

export class MessageEvent extends ServerEvent {
    type: ServerEventType.message;
    constructor(public data: MessageData) {
        super();
    }
}
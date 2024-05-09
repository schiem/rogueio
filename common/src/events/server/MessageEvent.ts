import { ServerEvent, ServerEventType } from "./ServerEvent";

export type MessageEventData = {message: string, replacements?: (string | number)[]};

export class MessageEvent extends ServerEvent {
    type = ServerEventType.message;
    constructor(public data: MessageEventData) {
        super();
    }
}
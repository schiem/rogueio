import { ServerEvent, ServerEventType } from "./ServerEvent";

export type MessageEventData = {message: string, replacements?: (Promise<string> | string)[]};

export class MessageEvent extends ServerEvent {
    type = ServerEventType.message;
    constructor(public data: MessageEventData) {
        super();
    }
}
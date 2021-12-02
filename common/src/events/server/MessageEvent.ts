import { ServerEvent, ServerEventType } from "./ServerEvent";

export type MessageData = {message: string, replacements?: (Promise<string> | string)[]};

export class MessageEvent extends ServerEvent {
    type: ServerEventType.message;
    constructor(public data: MessageData) {
        super();
    }
}
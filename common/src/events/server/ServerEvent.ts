import { NetworkEvent } from "../NetworkEvent";

export enum ServerEventType {
    init,
    update,
    message,
}
export class ServerEvent extends NetworkEvent {
    type: ServerEventType;
}
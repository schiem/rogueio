import { NetworkEvent } from "../NetworkEvent";

export enum ClientEventType {
    move,
    action,
    grab,
    drop
}
export class ClientEvent extends NetworkEvent {
    type: ClientEventType;
    clientId: string;
}

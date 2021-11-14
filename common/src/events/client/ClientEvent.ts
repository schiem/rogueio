import { NetworkEvent } from "../NetworkEvent";

export enum ClientEventType {
    move,
    action
}
export class ClientEvent extends NetworkEvent {
    type: ClientEventType;
    clientId: string;
    data: any;
}

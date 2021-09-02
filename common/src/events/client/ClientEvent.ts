import { NetworkEvent } from "../NetworkEvent";

export enum ClientEventType {
    move
}
export class ClientEvent extends NetworkEvent {
    type: ClientEventType;
    clientId: string;
    data: any;

    serialize(): string | ArrayBuffer {
        return JSON.stringify(this);
    }
}

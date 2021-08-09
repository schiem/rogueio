import { NetworkEvent } from "../NetworkEvent";

export enum ServerEventType {
    init,
    update,
    message,
    addComponent,
    removeComponent,
    addEntity,
    removeEntity
}
export class ServerEvent extends NetworkEvent {
    type: ServerEventType;
}
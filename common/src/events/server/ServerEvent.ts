import { NetworkEvent } from "../NetworkEvent";

export enum ServerEventType {
    init,
    update,
    message,
    addComponent,
    removeComponent,
    addEntity,
    removeEntity,
    removeVisibleComponents
}
export class ServerEvent extends NetworkEvent {
    type: ServerEventType;
}
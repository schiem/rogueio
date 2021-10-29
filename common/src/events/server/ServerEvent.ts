import { NetworkEvent } from "../NetworkEvent";

export enum ServerEventType {
    init = 1,
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
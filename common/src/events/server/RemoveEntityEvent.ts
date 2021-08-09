import { ServerEvent, ServerEventType } from "./ServerEvent";

export type RemoveEntityData = {
    id: number;
};

export class RemoveEntityEvent extends ServerEvent {
    type = ServerEventType.removeEntity;
    data: RemoveEntityData;

    constructor(id: number) {
        super();
        this.data = {
            id,
        };
    }
}
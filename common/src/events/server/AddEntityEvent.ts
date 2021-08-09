import { ServerEvent, ServerEventType } from "./ServerEvent";

export type AddEntityData = {
    id: number;
};

export class AddEntityEvent extends ServerEvent {
    type = ServerEventType.addEntity;
    data: AddEntityData;

    constructor(id: number) {
        super();
        this.data = {
            id,
        };
    }
}
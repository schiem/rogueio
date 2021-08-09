import { ServerEvent, ServerEventType } from "./ServerEvent";

export type RemoveEntityComponentData = {
    id: number;
    system: string;
};

export class RemoveEntityComponentEvent extends ServerEvent {
    type = ServerEventType.removeComponent;
    data: RemoveEntityComponentData;

    constructor(id: number, system: string) {
        super();
        this.data = {
            id,
            system,
        };
    }
}
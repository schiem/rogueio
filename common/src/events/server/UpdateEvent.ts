import { ServerEvent, ServerEventType } from "./ServerEvent";

export type UpdateEntityData = {
    id: number;
    system: string;
    properties: Record<string, any>
};

export class UpdateEntityEvent extends ServerEvent {
    type = ServerEventType.update;
    data: UpdateEntityData;

    constructor(id: number, system: string, properties: Record<string, any>) {
        super();
        this.data = {
            id,
            system: system,
            properties
        };
    }
}
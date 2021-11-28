import { ServerEvent, ServerEventType } from "./ServerEvent";

export type UpdateEntityData = {
    id: number;
    triggeredBy?: number;
    system: string;
    properties: Record<string, any>
};

export class UpdateEntityEvent extends ServerEvent {
    type = ServerEventType.update;
    data: UpdateEntityData;

    constructor(id: number, system: string, properties: Record<string, any>, triggeredBy?: number) {
        super();
        this.data = {
            id,
            system: system,
            properties,
        };
        if (triggeredBy !== undefined) {
            this.data.triggeredBy = triggeredBy;
        }
    }
}
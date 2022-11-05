import { ServerEvent, ServerEventType } from "./ServerEvent";

export type UpdateEntityData = {
    id: number;
    triggeredBy?: number;
    system: string;
    properties: Record<string, unknown>
};

export class UpdateEntityEvent extends ServerEvent {
    type = ServerEventType.update;
    data: UpdateEntityData;

    constructor(id: number, system: string, properties: Record<string, unknown>, triggeredBy?: number) {
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
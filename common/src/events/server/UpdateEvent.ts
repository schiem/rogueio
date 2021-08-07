import { ServerEvent, ServerEventType } from "./ServerEvent";

export type UpdateData = {
    id: number;
    property: string;
    value: any;
};

export class UpdateEvent extends ServerEvent {
    type = ServerEventType.update;
    data: UpdateData;

    constructor(id: number, property: string, value: any) {
        super();
        this.data = {
            id,
            property,
            value
        };
    }
}
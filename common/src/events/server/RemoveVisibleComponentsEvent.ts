import { ServerEvent, ServerEventType } from "./ServerEvent";

export type RemoveVisibleComponentsData = {
    id: number;
};

export class RemoveVisibleComponentsEvent extends ServerEvent {
    type = ServerEventType.removeVisibleComponents;
    data: RemoveVisibleComponentsData;

    constructor(id: number) {
        super();
        this.data = {
            id,
        };
    }
}
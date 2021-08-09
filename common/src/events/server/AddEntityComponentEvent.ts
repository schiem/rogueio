import { ServerEvent, ServerEventType } from "./ServerEvent";

export type AddEntityComponentData = {
    id: number;
    system: string;
    component: any
};

export class AddEntityComponentEvent extends ServerEvent {
    type = ServerEventType.addComponent;
    data: AddEntityComponentData;

    constructor(id: number, system: string, component: any) {
        super();
        this.data = {
            id,
            system,
            component
        };
    }
}
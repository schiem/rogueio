import { ServerEvent, ServerEventType } from "./ServerEvent";

export type AddEntityComponentData = {
    id: number;
    components: Record<string, any>
};

export class AddEntityComponentsEvent extends ServerEvent {
    type = ServerEventType.addComponent;
    data: AddEntityComponentData;

    constructor(id: number, components: Record<string, any>) {
        super();
        this.data = {
            id,
            components
        };
    }
}
import { ClientEvent, ClientEventType } from "./ClientEvent";

export type ActionData = {
};

export class ActionEvent extends ClientEvent {
    type = ClientEventType.action;
    data: ActionData;

    constructor() {
        super();
        this.data = {
        };
    }
}
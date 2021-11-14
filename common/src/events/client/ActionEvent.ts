import { Point } from "../../types/Points";
import { ClientEvent, ClientEventType } from "./ClientEvent";

export type ActionData = {
    id: number;
    target: Point | number;
};

export class ActionEvent extends ClientEvent {
    type = ClientEventType.action;
    data: ActionData;

    constructor(id: number, target: Point | number) {
        super();
        this.data = {
            id, 
            target
        };
    }
}
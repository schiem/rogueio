import { EquipmentSlot } from "../../components/EquipmentComponent";
import { ClientEvent, ClientEventType } from "./ClientEvent";

export type EquipData = {
    target: number,
    slot: EquipmentSlot
}

export class EquipEvent extends ClientEvent {
    type = ClientEventType.equip;
    data: EquipData;

    constructor(target: number, slot: EquipmentSlot) {
        super();
        this.data = {
            target,
            slot
        };
    }
}
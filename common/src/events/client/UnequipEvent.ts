import { EquipmentSlot } from "../../components/EquipmentComponent";
import { ClientEvent, ClientEventType } from "./ClientEvent";

export type UnequipData = {
    slot: EquipmentSlot;
}

export class UnequipEvent extends ClientEvent {
    type = ClientEventType.unequip;
    data: UnequipData;

    constructor(slot: EquipmentSlot) {
        super();
        this.data = {
            slot
        };
    }
}
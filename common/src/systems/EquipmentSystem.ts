import { EquipmentComponent } from "../components/EquipmentComponent";
import { ComponentSystem, ReplicationMode } from "./ComponentSystem";

export class EquipmentSystem extends ComponentSystem<EquipmentComponent> {
    replicationMode: ReplicationMode = 'self';

    entityHasEquipped(entityId: number, equipmentId: number): boolean {
        const component = this.getComponent(entityId);
        if (!component) {
            return false;
        }

        return Object.values(component.items).indexOf(equipmentId) > -1;
    }
}
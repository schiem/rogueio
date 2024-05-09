import { InventoryComponent } from "../../../common/src/components/InventoryComponent";
import { InventorySystem } from "../../../common/src/systems/InventorySystem";

export class ClientInventorySystem extends InventorySystem {
    componentPropertyUpdaters: Record<string, (id: number, component: InventoryComponent, newValue: unknown) => unknown> = {
        addedItem: (id: number, component: InventoryComponent, newValue: unknown) => {
            component.items.push(newValue as { id: number, weight: number});
            return component.items;
        },
        removedItem: (id: number, component: InventoryComponent, idx: unknown) => {
            component.items.splice(idx as number, 1);
            return component.items;
        }
    };
}
import { Bus } from "../../../common/src/bus/Buses";
import { EquipmentSlot } from "../../../common/src/components/EquipmentComponent";
import { EntityManager } from "../../../common/src/entities/EntityManager";
import { EquipmentSystem } from "../../../common/src/systems/EquipmentSystem";
import { EquippableSystem } from "../../../common/src/systems/EquippableSystem";
import { LocationSystem } from "../../../common/src/systems/LocationSystem";
import { ServerDungeonProvider } from "../models/ServerGame";
import { ServerInventorySystem } from "./ServerInventorySystem";

export class ServerEquipmentSystem extends EquipmentSystem {
    constructor(entityManager: EntityManager, private dungeonProvider: ServerDungeonProvider, private equippableSystem: EquippableSystem, private inventorySystem: ServerInventorySystem, private locationSystem: LocationSystem) {
        super(entityManager);
    }

    equip(entityId: number, entityToEquip: number, slotToEquip: EquipmentSlot): void {
        const equipmentComponent = this.getComponent(entityId);
        const equippableComponent = this.equippableSystem.getComponent(entityToEquip);

        if (
            !equipmentComponent ||
            !equippableComponent || 
            equippableComponent.slots.indexOf(slotToEquip) === -1
        ) {
            // no message to send
            return;
        }

        this.unequip(entityId, slotToEquip);
        this.updateComponent(entityId, {
            [`items.${slotToEquip}`]: entityToEquip
        });
    }

    unequip(entityId: number, slot: EquipmentSlot): void {
        const equipmentComponent = this.getComponent(entityId);
        const currentlyEquipped = equipmentComponent?.items[slot];
        if (!equipmentComponent || !currentlyEquipped) {
            return;
        }

        const canAddToInventory = this.inventorySystem.canAddToInventory(entityId, currentlyEquipped);
        if (canAddToInventory === true) {
            // Move it from equipment -> inventory
            this.inventorySystem.addItem(entityId, currentlyEquipped);
        } else {
            const location = this.locationSystem.getComponent(entityId)?.location;
            const existingLocation = this.locationSystem.getComponent(currentlyEquipped);
            if (!existingLocation) {
                Bus.messageEmitter.emit({
                    entities: [entityId],
                    message: 'messages/itemCannotBeDropped',
                    replacements: [currentlyEquipped]
                });
                return;
            }

            if (!location) {
                // Man, I don't even know how you would get here
                return;
            }

            if (this.locationSystem.moveAndCollideEntity(currentlyEquipped, location, this.dungeonProvider.dungeon)) 
            {
                // Drop it on the floor
                Bus.messageEmitter.emit({
                    entities: [entityId],
                    message: 'messages/itemSlipped',
                    replacements: [currentlyEquipped]
                });

            }
            else {
                Bus.messageEmitter.emit({
                    entities: [entityId],
                    message: 'messages/itemCannotBeDroppedHere',
                    replacements: [currentlyEquipped]
                });
                return;
            }
        }

        this.updateComponent(entityId, {
            [`items.${slot}`]: undefined 
        });
    }
}
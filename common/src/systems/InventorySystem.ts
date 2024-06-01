import { Bus } from "../bus/Buses";
import { InventoryComponent } from "../components/InventoryComponent";
import { EntityManager } from "../entities/EntityManager";
import { pointDistance } from "../types/Points";
import { CarryableSystem } from "./CarryableComponent";
import { ComponentSystem, ReplicationMode } from "./ComponentSystem";
import { LocationSystem } from "./LocationSystem";

export class InventorySystem extends ComponentSystem<InventoryComponent> {
    replicationMode: ReplicationMode = 'self';

    constructor(entityManager: EntityManager, protected locationSystem: LocationSystem, protected carryableSystem: CarryableSystem) {
        super(entityManager);
    }

    canPickUpFromGround(entityId: number, entityToPickUp: number): boolean {
        const entityLocation = this.locationSystem.getComponent(entityId);
        const itemLocation = this.locationSystem.getComponent(entityToPickUp);

        if (
            !itemLocation?.location ||
            !entityLocation?.location ||
            pointDistance(itemLocation.location, entityLocation.location) > 1
        ) {
            // No message needed
            return false;
        }

        const inventoryState = this.canAddToInventory(entityId, entityToPickUp);

        if (inventoryState === true) {
            return true;
        }

        if (inventoryState === 'tooHeavy') {
            // Show an error
            Bus.messageEmitter.emit({
                message: 'common/messages/objectTooHeavy',
                entities: [entityId]
            });
        }

        if (inventoryState === 'full') {
            // Show an error
            Bus.messageEmitter.emit({
                message: 'common/messages/inventoryFull',
                entities: [entityId]
            });
        }

        return false;
    }

    canAddToInventory(entityId: number, itemId: number): 'doesNotExist' | 'tooHeavy' | 'full' | true {
        const inventoryComponent = this.getComponent(entityId);
        const itemCarryable = this.carryableSystem.getComponent(itemId);
        if (!inventoryComponent || !itemCarryable) {
            return 'doesNotExist';
        }

        if (inventoryComponent.items.length >= inventoryComponent.maxSpace) {
            return 'full';
        }

        return true;
    }

    entityIsCarrying(entityId: number, itemId: number): boolean {
        const component = this.getComponent(entityId);
        if (!component) {
            return false;
        }
        return component.items.findIndex(x => x === itemId) > -1;
    }
}
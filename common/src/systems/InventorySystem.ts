import { InventoryComponent } from "../components/InventoryComponent";
import { EntityManager } from "../entities/EntityManager";
import { pointDistance } from "../types/Points";
import { CarryableSystem } from "./CarryableComponent";
import { ComponentSystem, ReplicationMode } from "./ComponentSystem";
import { LocationSystem } from "./LocationSystem";
import { Bus } from "../bus/Buses"

export class InventorySystem extends ComponentSystem<InventoryComponent> {
    replicationMode: ReplicationMode = 'self';

    constructor(entityManager: EntityManager, private locationSystem: LocationSystem, private carryableSystem: CarryableSystem) {
        super(entityManager);
    }

    attemptPickUp(entityId: number, entityToPickUp: number): void {
        const component = this.getComponent(entityId);
        const carryable = this.carryableSystem.getComponent(entityToPickUp);
        if (!component || !carryable || !this.canPickUp(entityId, entityToPickUp)) {
            return;
        }

        const oldWeight = component.currentWeight;
        component.currentWeight += carryable.weight;
        const item = {
            id: entityToPickUp,
            weight: carryable.weight
        };
        component.items.push(item);

        this.locationSystem.removeComponentFromEntity(entityToPickUp);
        this.componentUpdatedEmitter.emit({
            id: entityId,
            oldProps: {
                weight: oldWeight
            },
            props: {
                currentWeight: component.currentWeight,
                addedItem: item 
            }
        });
    }

    dropItem(entityId: number, entityToDrop: number): void {
        const component = this.getComponent(entityId);
        if (!component) {
            return;
        }

        const idx = component.items.findIndex(x => x.id === entityToDrop);
        if (idx > 0) {
            const item = component.items[idx];
            const oldWeight = component.currentWeight;

            component.currentWeight -= item.weight;
            component.items.splice(idx, 1);
            this.componentUpdatedEmitter.emit({
                id: entityId,
                oldProps: {
                    weight: oldWeight
                },
                props: {
                    currentWeight: component.currentWeight,
                    removedItem: idx
                }
        });
        }
    }

    entityIsCarrying(entityId: number, itemId: number): boolean {
        const component = this.getComponent(entityId);
        const carryable = this.carryableSystem.getComponent(itemId);
        if (!component || !carryable) {
            return false;
        }
        return component.items.findIndex(x => x.id === itemId) > -1;
    }

    canPickUp(entityId: number, entityToPickUp: number): boolean {
        const entityLocation = this.locationSystem.getComponent(entityId);
        const inventoryComponent = this.getComponent(entityId);
        const itemLocation = this.locationSystem.getComponent(entityToPickUp);
        const itemCarryable = this.carryableSystem.getComponent(entityToPickUp);

        if (
            !itemLocation ||
            !entityLocation ||
            !itemCarryable ||
            !inventoryComponent ||
            pointDistance(itemLocation.location, entityLocation.location) > 1
        ) {
            // No message needed
            return false;
        }

        if ((inventoryComponent.currentWeight + itemCarryable.weight) > inventoryComponent.maxWeight) {
            // Show an error
            Bus.messageEmitter.emit({
                message: 'common/messages/objectTooHeavy',
                entities: [entityId]
            });
            return false;
        }

        if (inventoryComponent.items.length >= inventoryComponent.maxSpace) {
            // Show an error
            Bus.messageEmitter.emit({
                message: 'common/messages/inventoryFull',
                entities: [entityId]
            });
            return false;
        }

        return true;
    }
}
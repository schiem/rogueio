import { InventoryComponent } from "../components/InventoryComponent";
import { EntityManager } from "../entities/EntityManager";
import { pointDistance } from "../types/Points";
import { CarryableSystem } from "./CarryableComponent";
import { ComponentSystem, ReplicationMode } from "./ComponentSystem";
import { LocationSystem } from "./LocationSystem";

export class InventorySystem extends ComponentSystem<InventoryComponent> {
    replicationMode: ReplicationMode = 'self';

    constructor(entityManager: EntityManager, private locationSystem: LocationSystem, private carryableSystem: CarryableSystem) {
        super(entityManager);
    }

    pickUp(entityId: number, entityToPickUp: number): void {
        const component = this.getComponent(entityId);
        const carryable = this.carryableSystem.getComponent(entityToPickUp);
        if (!component
            || !carryable
            || component.currentWeight + carryable.weight > component.maxWeight
            || component.items.length + 1 > component.maxSpace
            || !this.canPickUp(entityId, entityToPickUp)) {
            return;
        }

        const oldWeight = component.currentWeight;
        component.currentWeight += carryable.weight;
        component.items.push(entityToPickUp);

        this.locationSystem.removeComponentFromEntity(entityToPickUp);
        this.componentUpdatedEmitter.emit({
            id: entityId,
            oldProps: {
                weight: oldWeight
            },
            props: {
                currentWeight: component.currentWeight,
                addedItem: entityToPickUp
            }
        });
    }

    entityIsCarrying(entityId: number, itemId: number): boolean {
        const component = this.getComponent(entityId);
        const carryable = this.carryableSystem.getComponent(itemId);
        if (!component || !carryable) {
            return false;
        }
        return component.items.indexOf(itemId) > -1;
    }

    private canPickUp(entityId: number, entityToPickUp: number): boolean {
        const entityLocation = this.locationSystem.getComponent(entityId);
        const itemLocation = this.locationSystem.getComponent(entityToPickUp);

        if (!itemLocation || !entityLocation) {
            return false;
        }
        return pointDistance(itemLocation.location, entityLocation.location) <= 1;
    }
}
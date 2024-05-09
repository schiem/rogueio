import { Bus } from "../../../common/src/bus/Buses";
import { EntityManager } from "../../../common/src/entities/EntityManager";
import { CarryableSystem } from "../../../common/src/systems/CarryableComponent";
import { InventorySystem } from "../../../common/src/systems/InventorySystem";
import { LocationSystem } from "../../../common/src/systems/LocationSystem";
import { ServerDungeonProvider } from "../models/ServerGame";

export class ServerInventorySystem extends InventorySystem {

    constructor(entityManager: EntityManager, locationSystem: LocationSystem, carryableSystem: CarryableSystem,  private dungeonProvider: ServerDungeonProvider) {
        super(entityManager, locationSystem, carryableSystem)
    }

    attemptPickUp(entityId: number, entityToPickUp: number): void {
        const component = this.getComponent(entityId);
        const carryable = this.carryableSystem.getComponent(entityToPickUp);
        if (!component || !carryable || !this.canPickUpFromGround(entityId, entityToPickUp)) {
            return;
        }

        this.addItem(entityId, entityToPickUp);
    }

    addItem(entityId: number, entityToAdd: number): void {
        const component = this.getComponent(entityId);
        const carryable = this.carryableSystem.getComponent(entityToAdd);
        if (!component || !carryable) {
            return;
        }
        const oldWeight = component.currentWeight;
        component.currentWeight += carryable.weight;
        const item = {
            id: entityToAdd,
            weight: carryable.weight
        };
        component.items.push(item);

        // If the entity has a location set it to nothing
        this.locationSystem.unsetLocation(entityToAdd);

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
        const location = this.locationSystem.getComponent(entityId);
        if (!component || !location?.location) {
            return;
        }

        const idx = component.items.findIndex(x => x.id === entityToDrop);
        if (idx > -1) {
            const item = component.items[idx];
            const oldWeight = component.currentWeight;

            if (!this.locationSystem.moveAndCollideEntity(entityToDrop, location.location, this.dungeonProvider.dungeon)) {
                Bus.messageEmitter.emit({
                    entities: [entityId],
                    message: 'messages/itemCannotBeDroppedHere',
                    replacements: [entityToDrop]
                });
                return;
            }

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
}
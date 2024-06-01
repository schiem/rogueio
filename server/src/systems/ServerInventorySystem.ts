import { Bus } from "../../../common/src/bus/Buses";
import { EntityManager } from "../../../common/src/entities/EntityManager";
import { CarryableSystem } from "../../../common/src/systems/CarryableComponent";
import { InventorySystem } from "../../../common/src/systems/InventorySystem";
import { LocationSystem } from "../../../common/src/systems/LocationSystem";
import { ServerDungeonProvider } from "../models/ServerGame";

export class ServerInventorySystem extends InventorySystem {
    constructor(entityManager: EntityManager, locationSystem: LocationSystem, carryableSystem: CarryableSystem,  private dungeonProvider: ServerDungeonProvider) {
        super(entityManager, locationSystem, carryableSystem)

        entityManager.entityWillBeRemovedEmitter.subscribe((entityId) => {
            const component = this.carryableSystem.getComponent(entityId);
            if (component?.carriedBy !== undefined) {
                this.removeItem(component.carriedBy, entityId);
            }
        });
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
        component.items.push(entityToAdd);

        // If the entity has a location set it to nothing
        this.locationSystem.unsetLocation(entityToAdd);

        this.componentUpdatedEmitter.emit({
            id: entityId,
            oldProps: {
            },
            props: {
                addedItem: entityToAdd
            }
        });

        this.carryableSystem.updateComponent(entityToAdd, {
            carriedBy: entityId
        });
    }

    dropItem(entityId: number, entityToDrop: number): void {
        const component = this.getComponent(entityId);
        const location = this.locationSystem.getComponent(entityId);
        if (!component || !location?.location) {
            return;
        }

        if (!this.locationSystem.moveAndCollideEntity(entityToDrop, location.location, this.dungeonProvider.dungeon)) {
            Bus.messageEmitter.emit({
                entities: [entityId],
                message: 'messages/itemCannotBeDroppedHere',
                replacements: [entityToDrop]
            });
            return;
        }

        this.removeItem(entityId, entityToDrop);
    }

    removeItem(entityId: number, entityToRemove: number): void {
        const component = this.getComponent(entityId);
        if (!component) {
            return;
        }
        const idx = component.items.findIndex(x => x === entityToRemove);
        if (idx < 0) {
            return;
        }

        component.items.splice(idx, 1);
        this.componentUpdatedEmitter.emit({
            id: entityId,
            oldProps: {
            },
            props: {
                removedItem: idx
            }
        });

        this.carryableSystem.updateComponent(entityToRemove, {
            carriedBy: undefined 
        });
    } 
}
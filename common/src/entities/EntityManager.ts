import { EventEmitter } from "../events/EventEmitter";
import { GameSystems } from "../models/Game";
import { ReplicationMode } from "../systems/ComponentSystem";

/**
 * The base of the ECS.  Responsible for creating new 'entities' (which 
 * are really just Ids), storing them, and removing them.
 */
export class EntityManager {
    entityRemovedEmitter = new EventEmitter<number>();
    entityWillBeRemovedEmitter = new EventEmitter<number>();
    entityAddedEmitter = new EventEmitter<number>();
    private entities: Record<number, boolean> = {};
    private currentEntity = 0;

    peekNextEntity(): number {
        return this.currentEntity;
    }

    getNextEntity(): number {
        const entityId = this.currentEntity;

        this.currentEntity++;
        return entityId;
    }

    addNextEntity(): number {
        const entityId = this.getNextEntity();
        this.addEntity(entityId);
        return entityId;
    }

    addEntity(entityId: number): void {
        this.entities[entityId] = true;
        this.entityAddedEmitter.emit(entityId);
    }

    removeEntity(entityId: number): void {
        this.entityWillBeRemovedEmitter.emit(entityId);
        delete this.entities[entityId];
        this.entityRemovedEmitter.emit(entityId);
    }

    hasEntity(entityId: number): boolean {
        return this.entities[entityId] !== undefined;
    }

    forEachEntity(fn: (id: number) => void): void {
        for(let key in this.entities) {
            fn(parseInt(key));
        }
    }

    entityIsAwareOfComponent(entityToSendTo: number, entityId: number, systems: GameSystems, replicationMode: ReplicationMode): boolean {
        const allySystem = systems.ally;
        switch (replicationMode) {
            case 'none':
                return false;
            case 'ally':
                return allySystem.entitiesAreAllies(entityToSendTo, entityId);
            case 'self':
                return entityId === entityToSendTo;
            case 'visible':
                // For now, all allies are visible, always.
                if (allySystem.entitiesAreAllies(entityToSendTo, entityId)) {
                    return true;
                }

                const visibilitySystem = systems.visibility;
                return visibilitySystem.entityIsVisible(entityToSendTo, entityId);

            default: 
                return false;
        }
    }

}
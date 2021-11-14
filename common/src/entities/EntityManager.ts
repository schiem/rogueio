import { EventEmitter } from "../events/EventEmitter";

/**
 * The base of the ECS.  Responsible for creating new 'entities' (which 
 * are really just Ids), storing them, and removing them.
 */
export class EntityManager {
    entityRemovedEmitter = new EventEmitter<number>();
    entityAddedEmitter = new EventEmitter<number>();
    private entities: Record<number, boolean> = {};
    private currentEntity = 0;

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
}
import { EntityManager } from "../entities/EntityManager";

/**
 * The base component system.
 * Handles adding and removing components.  Includes a subscriber so 
 * components removed from the core entity manager are automatically removed
 * from the system.
 */
export abstract class ComponentSystem {
    // A mapping of entities that this system manages to the component
    // that this sytem manages
    entities: Record<number, any> = {}

    constructor(entityManager: EntityManager) {
        entityManager.entityRemovedEmitter.subscribe((entityId) => {
            if (this.getComponent(entityId)) {
                this.removeComponentFromEntity(entityId);
            }
        });
    }

    /**
     * Gets the component for a given entity, or undefined if it's not set.
     */
    getComponent(id: number): any | undefined {
        return this.entities[id];
    }

    /**
     * Adds the given component to the system for the supplied entity.
     * It is expected that the component will already have been created outside
     * of the system (using one of the Generator functions). 
     */
    addComponentForEntity(id: number, component: any): void {
        this.entities[id] = component;
    }

    /**
     * Removes the given component from this entity. 
     */
    removeComponentFromEntity(id: number): void {
        delete this.entities[id];
    }

    /**
     * Handles the work required to create this object after serializing it (e.g. to send across the network).
     * Often, much of the redundant data will be removed before deserializing to make network
     * requests smaller. This function will reconstruct them.
     */
    abstract postDeserialize(): void;
}
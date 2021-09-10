import { EntityManager } from "../entities/EntityManager";
import { EventEmitter } from "../events/EventEmitter";

export type ReplicationMode = 'self' | 'ally' | 'visible' | 'none';
export type IdComponent<T> = {id: number, component: T};
/**
 * The base component system.
 * Handles adding and removing components.  Includes a subscriber so 
 * components removed from the core entity manager are automatically removed
 * from the system.
 */
// TODO - add checks everywhere to make sure the entity exists
export abstract class ComponentSystem<T> {
    abstract replicationMode: ReplicationMode;
    // A mapping of entities that this system manages to the component
    // that this sytem manages
    entities: Record<number, T> = {}
    componentPropertyUpdaters: Record<string, (id: number, component: any, newValue: any) => void>;

    addedComponentEmitter = new EventEmitter<IdComponent<T>>();
    removedComponentEmitter = new EventEmitter<IdComponent<T>>();
    componentUpdatedEmitter = new EventEmitter<{id: number, props: Record<string, any>, oldProps: Record<string, any>}>();

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
     * Updates the properties on a given component. 
     */
    updateComponent(id: number, properties: Record<string, any>): void {
        const component = this.getComponent(id);
        if (!component) {
            return;
        }

        for (let key in properties) {
            if (this.componentPropertyUpdaters[key] !== undefined) {
                // If there's a "special" handling case, then allow the specific system to handle it
                this.componentPropertyUpdaters[key](id, component, properties[key]);
            } else {
                // Just update the property without fanfare
                component[key] = properties[key];
            }
        }
    }

    /**
     * Adds the given component to the system for the supplied entity.
     * It is expected that the component will already have been created outside
     * of the system (using one of the Generator functions). 
     */
    addComponentForEntity(id: number, component: T): void {
        this.entities[id] = component;
        this.addedComponentEmitter.emit({id, component});
    }

    /**
     * Removes the given component from this entity. 
     */
    removeComponentFromEntity(id: number): void {
        const component = this.getComponent(id);
        if (!component) {
            return;
        }
        delete this.entities[id];
        this.removedComponentEmitter.emit({id, component});
    }

    /**
     * Handles the work required to create this object after serializing it (e.g. to send across the network).
     * Often, much of the redundant data will be removed before deserializing to make network
     * requests smaller. This function will reconstruct them.
     */
    postDeserialize(): void {
        Object.keys(this.entities).forEach((entityId) => {
            const id = parseInt(entityId);
            this.addedComponentEmitter.emit({id, component: this.entities[id]});
        });
    }

    abstract toJSON(): any;
}
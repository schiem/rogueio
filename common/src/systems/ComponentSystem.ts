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
    protected entities: Record<number, T> = {}
    componentPropertyUpdaters: Record<string, (id: number, component: T, newValue: unknown) => unknown>;

    addedComponentEmitter = new EventEmitter<IdComponent<T>>();
    removedComponentEmitter = new EventEmitter<IdComponent<T>>();
    componentUpdatedEmitter = new EventEmitter<{id: number, props: Record<string, unknown>, oldProps: Record<string, unknown>, triggeredBy?: number}>();

    constructor(entityManager: EntityManager) {
        entityManager.entityRemovedEmitter.subscribe((entityId) => {
            if (this.getComponent(entityId)) {
                this.removeComponentFromEntity(entityId, true);
            }
        });
    }

    getAllComponents(): Record<number, T> {
        return this.entities;
    }

    /**
     * Gets the component for a given entity, or undefined if it's not set.
     */
    getComponent(id: number): T | undefined {
        return this.entities[id];
    }

    /**
     * Updates the properties on a given component. 
     */
    updateComponent(id: number, properties: Record<string, unknown>, triggeredBy?: number): void {
        const component: T | undefined = this.getComponent(id);
        if (!component) {
            return;
        }

        const oldProps: Record<string, unknown> = {};
        for (let key in properties) {
            if (this.componentPropertyUpdaters?.[key] !== undefined) {
                // If there's a "special" handling case, then allow the specific system to handle it
                oldProps[key] = this.componentPropertyUpdaters[key](id, component, properties[key]);
            } else {
                // Just update the property without fanfare
                oldProps[key] = this.updateNestedProperty(component, key, properties[key]);
            }
        }

        // Emit that the values changed 
        this.componentUpdatedEmitter.emit({id, props: properties, oldProps, triggeredBy });
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
    removeComponentFromEntity(id: number, supressEvent = false): void {
        const component = this.getComponent(id);
        if (!component) {
            return;
        }
        delete this.entities[id];
        if (!supressEvent) {
            this.removedComponentEmitter.emit({id, component});
        }
    }
    /**
     * Fetches any additional data in the system associated with this component (e.g. data shared between multiple components) 
     * Returns undefined if no data is needed
     */
    additionalDataForEntity(entityId: number): unknown {
        return;
    }

    private updateNestedProperty(component: T, property: string, value: unknown): unknown {
        const properties = property.split('.');
        let currentObj = component as Record<string, unknown>;
        let oldProp: unknown;
        for(let i = 0; i < properties.length; i++) {
            const prop = properties[i];
            if (currentObj[prop] === undefined) {
                throw new Error(`Could not update non existent property ${property}`);
            }

            if (i === properties.length - 1) {
                oldProp = currentObj[prop];
                currentObj[prop] = value;
            } else {
                currentObj = currentObj[prop] as Record<string, unknown>;
            }
        }
        return oldProp;
    }
}
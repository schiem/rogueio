import { SharedVisibilityComponent, VisiblityComponent } from "../components/VisibilityComponent";
import { EntityManager } from "../entities/EntityManager";
import { EventEmitter } from "../events/EventEmitter";
import { Point } from "../types/Points";
import { ComponentSystem } from "./ComponentSystem";
import { LocationSystem } from "./LocationSystem";

export class VisiblitySystem extends ComponentSystem {
    entities: Record<number, VisiblityComponent>;
    sharedComponents: SharedVisibilityComponent[] = [];
    visionChangedEmitter = new EventEmitter<{id: number, added: Point[], removed: Point[], seenAdded: Point[]}>();
    singleVisionPointChanged = new EventEmitter<Point>();

    componentPropertyUpdaters = {
        added: (id: number, component: VisiblityComponent, added: Point[]) => {
            added.forEach((point) => {
                if (!component.visible[point.x]) {
                    component.visible[point.x] = {};
                }
                component.visible[point.x][point.y] = true;
                this.singleVisionPointChanged.emit(point);
            });
        },
        removed: (id: number, component: VisiblityComponent, removed: Point[]) => {
            removed.forEach((point) => {
                delete component.visible[point.x]?.[point.y];
                this.singleVisionPointChanged.emit(point);
            });
        },
        seen: (id: number, component: VisiblityComponent, seen: Point[]) => {
            const sharedComponent = this.sharedComponents[component.sharedComponentId];
            if (!sharedComponent) {
                return;
            }

            seen.forEach((point) => {
                sharedComponent.seen[point.x][point.y] = true;
                this.singleVisionPointChanged.emit(point);
            });
        },
    };
    
    constructor(entityManager: EntityManager, protected locationSystem: LocationSystem, private dungeonSize: Point) {
        super(entityManager);

        // For now, we only have the one shared visibility component
        this.addSharedComponent(dungeonSize);
    }


    tileIsVisible(entityId: number, location: Point): boolean {
        const component: VisiblityComponent = this.getComponent(entityId);
        if (!component) {
            return false;
        }

        return component.visible[location.x]?.[location.y];
    }

    tileWasSeen(sharedId: number, location: Point) {
        const sharedComponent = this.sharedComponents[sharedId];
        return sharedComponent && sharedComponent.seen[location.x]?.[location.y];
    }

    sharedTileIsVisible(sharedId: number, location: Point): boolean {
        const sharedComponent = this.sharedComponents[sharedId];
        return sharedComponent.entitiesInGroup.find((entityId) => {
            return this.tileIsVisible(entityId, location);
        }) !== undefined;
    }

    addSharedComponent(size: Point): number {
        const component = {
            seen: new Array(size.x),
            entitiesInGroup: []
        };
        for (let i = 0; i < component.seen.length; i++) {
            component.seen[i] = new Array(size.y);
        }

        this.sharedComponents.push(component);
        return this.sharedComponents.length - 1;
    }

    /**
     * Adds the given component to the system for the supplied entity.
     * It is expected that the component will already have been created outside
     * of the system (using one of the Generator functions). 
     */
    addComponentForEntity(id: number, component: VisiblityComponent): void {
        if (component.sharedComponentId === undefined) {
            component.sharedComponentId = this.addSharedComponent(this.dungeonSize);
        }

        const sharedComponent = this.sharedComponents[component.sharedComponentId];
        sharedComponent.entitiesInGroup.push(id);

        super.addComponentForEntity(id, component);
    }

    /**
     * Removes the given component from this entity. 
     */
    removeComponentFromEntity(id: number): void {
        const component = this.getComponent(id);
        if (!component) {
            return;
        }

        const sharedComponent = this.sharedComponents[component.sharedComponentId];
        const entityIdx = sharedComponent.entitiesInGroup.indexOf(id);
        if (entityIdx !== -1) {
            sharedComponent.entitiesInGroup.splice(entityIdx, 1);
        }

        super.removeComponentFromEntity(id);
    }

    postDeserialize(): void {}
    toJSON(): any {}
}
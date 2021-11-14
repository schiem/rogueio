import { SharedVisibilityComponent, VisibilityComponent } from "../components/VisibilityComponent";
import { EntityManager } from "../entities/EntityManager";
import { EventEmitter } from "../events/EventEmitter";
import { Point } from "../types/Points";
import { Tile } from "../types/Tile";
import { AllySystem } from "./AllySystem";
import { ComponentSystem, ReplicationMode } from "./ComponentSystem";
import { HealthSystem } from "./HealthSystem";
import { LocationSystem } from "./LocationSystem";

export class VisibilitySystem extends ComponentSystem<VisibilityComponent> {
    replicationMode: ReplicationMode = 'ally';

    entities: Record<number, VisibilityComponent>;
    sharedComponents: Record<string, SharedVisibilityComponent> = {};
    visionPointsChanged = new EventEmitter<{point: Point, tile?: Tile}[]>();

    componentPropertyUpdaters = {
        added: (id: number, component: VisibilityComponent, added: Point[]) => {
            added.forEach((point) => {
                if (!component.visible[point.x]) {
                    component.visible[point.x] = {};
                }
                component.visible[point.x][point.y] = true;
                this.visionPointsChanged.emit([{point}]);
            });
        },
        removed: (id: number, component: VisibilityComponent, removed: Point[]) => {
            removed.forEach((point) => {
                delete component.visible[point.x]?.[point.y];
                this.visionPointsChanged.emit([{point}]);
            });
        },
        seen: (id: number, component: VisibilityComponent, seen: Tile[]) => {
            const sharedComponent = this.getSharedVisibilityComponent(id);
            if (!sharedComponent) {
                return;
            }

            const changed:{point: Point, tile?: Tile}[]  = [];
            seen.forEach((tile) => {
                sharedComponent.seen[tile.coords.x][tile.coords.y] = true;
                // TODO - consider uncoupling this, right now it's very heavily coupled
                changed.push({point: tile.coords, tile});
            });
            this.visionPointsChanged.emit(changed);
        },
    };
    
    constructor(entityManager: EntityManager, public allySystem: AllySystem, protected locationSystem: LocationSystem, healthSystem: HealthSystem, dungeonSize: Point) {
        super(entityManager);

        // Add a visibility component for every set of allies
        Object.keys(this.allySystem.groups).forEach((group) => {
            this.addSharedComponent(group, dungeonSize);
        })

        healthSystem.removedComponentEmitter.subscribe((data) => {
            if (entityManager.hasEntity(data.id)) {
                this.removeComponentFromEntity(data.id);
            }
        });
    }

    removeComponentFromEntity(id: number): void {
        const component = this.getComponent(id);
        if (!component) {
            return;
        }
        // TODO - this really only needs to be done on the client - should we subclass it?
        const points: {point: Point, tile?: Tile}[] = [];
        for(const x in component.visible) {
            for(const y in component.visible[x]) {
                points.push({
                    point: {
                        x: parseInt(x),
                        y: parseInt(y)
                    }
                });
            }
        }

        this.visionPointsChanged.emit(points);
        super.removeComponentFromEntity(id);
    }

    getSharedVisibilityComponent(entityId: number): SharedVisibilityComponent | undefined {
        const component = this.getComponent(entityId);
        if (!component) {
            return;
        }

        const allyComponent = this.allySystem.getComponent(entityId);
        if (!allyComponent) {
            return;
        }

        return this.sharedComponents[allyComponent.group];
    }

    tileIsVisible(entityId: number, location: Point): boolean {
        const component = this.getComponent(entityId);
        if (!component) {
            return false;
        }

        return component.visible[location.x]?.[location.y];
    }

    tileWasSeen(entityId: number, location: Point) {
        const sharedComponent = this.getSharedVisibilityComponent(entityId);
        return sharedComponent && sharedComponent.seen[location.x]?.[location.y];
    }

    sharedTileIsVisible(entityId: number, location: Point): boolean {
        const allyComponent = this.allySystem.getComponent(entityId);
        if (!allyComponent) {
            return this.tileIsVisible(entityId, location);
        }
        return this.groupTileIsVisible(allyComponent.group, location);
    }

    groupTileIsVisible(group: string, location: Point): boolean {
        const allies = this.allySystem.getAlliesForGroup(group);
        return allies?.find((entityId) => {
            return this.tileIsVisible(entityId, location);
        }) !== undefined;
    }

    addSharedComponent(group: string, size: Point): void {
        const component: SharedVisibilityComponent = {
            seen: new Array(size.x)
        };

        for (let i = 0; i < component.seen.length; i++) {
            component.seen[i] = new Array(size.y);
            for(let j = 0; j < component.seen[i].length; j++) {
                component.seen[i][j] = false;
            }
        }

        this.sharedComponents[group] = component;
    }

    additionalDataForEntity(entityId: number): any {
        const sharedComponent = this.getSharedVisibilityComponent(entityId);
        const allyComponent = this.allySystem.getComponent(entityId);
        if (!sharedComponent || !allyComponent) {
            return;
        }

        return {
            sharedComponents: {
                [allyComponent.group]: sharedComponent
            }
        };
    }
}
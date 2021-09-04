import { AllyComponent } from "../components/AllyComponent";
import { SharedVisibilityComponent, VisiblityComponent } from "../components/VisibilityComponent";
import { EntityManager } from "../entities/EntityManager";
import { EventEmitter } from "../events/EventEmitter";
import { Point } from "../types/Points";
import { Tile } from "../types/Tile";
import { AllySystem } from "./AllySystem";
import { ComponentSystem, ReplicationMode } from "./ComponentSystem";
import { LocationSystem } from "./LocationSystem";

export class VisiblitySystem extends ComponentSystem {
    replicationMode: ReplicationMode = 'ally';

    entities: Record<number, VisiblityComponent>;
    sharedComponents: Record<string, SharedVisibilityComponent> = {};
    visionChangedEmitter = new EventEmitter<{id: number, added: Point[], removed: Point[], seenAdded: Point[]}>();
    singleVisionPointChanged = new EventEmitter<{point: Point, tile?: Tile}>();

    componentPropertyUpdaters = {
        added: (id: number, component: VisiblityComponent, added: Point[]) => {
            added.forEach((point) => {
                if (!component.visible[point.x]) {
                    component.visible[point.x] = {};
                }
                component.visible[point.x][point.y] = true;
                this.singleVisionPointChanged.emit({point});
            });
        },
        removed: (id: number, component: VisiblityComponent, removed: Point[]) => {
            removed.forEach((point) => {
                delete component.visible[point.x]?.[point.y];
                this.singleVisionPointChanged.emit({point});
            });
        },
        seen: (id: number, component: VisiblityComponent, seen: Tile[]) => {
            const sharedComponent = this.getSharedVisibilityComponent(id);
            if (!sharedComponent) {
                return;
            }

            seen.forEach((tile) => {
                sharedComponent.seen[tile.coords.x][tile.coords.y] = true;
                // TODO - consider uncoupling this, right now it's very heavily coupled
                this.singleVisionPointChanged.emit({point: tile.coords, tile});
            });
        },
    };
    
    constructor(entityManager: EntityManager, public allySystem: AllySystem, protected locationSystem: LocationSystem, dungeonSize: Point) {
        super(entityManager);

        // Add a visibility component for every set of allies
        Object.keys(this.allySystem.groups).forEach((group) => {
            this.addSharedComponent(group, dungeonSize);
        })
    }

    getSharedVisibilityComponent(entityId: number): SharedVisibilityComponent | undefined {
        const component: VisiblityComponent = this.getComponent(entityId);
        if (!component) {
            return;
        }

        const allyComponent: AllyComponent = this.allySystem.getComponent(entityId);
        if (!allyComponent) {
            return;
        }

        return this.sharedComponents[allyComponent.group];
    }

    tileIsVisible(entityId: number, location: Point): boolean {
        const component: VisiblityComponent = this.getComponent(entityId);
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
        const allies = this.allySystem.getAlliesForEntity(entityId);
        if (!allies) {
            return this.tileIsVisible(entityId, location);
        }
        return allies.find((entityId) => {
            return this.tileIsVisible(entityId, location);
        }) !== undefined;
    }

    addSharedComponent(group: string, size: Point): void {
        const component: SharedVisibilityComponent = {
            seen: new Array(size.x)
        };

        for (let i = 0; i < component.seen.length; i++) {
            component.seen[i] = new Array(size.y);
        }

        this.sharedComponents[group] = component;
    }

    postDeserialize(): void {}
    toJSON(): any {}
}
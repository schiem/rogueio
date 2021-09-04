import { LocationComponent } from "../../../common/src/components/LocationComponent";
import { VisiblityComponent } from "../../../common/src/components/VisibilityComponent";
import { EntityManager } from "../../../common/src/entities/EntityManager";
import { Dungeon } from "../../../common/src/models/Dungeon";
import { AllySystem } from "../../../common/src/systems/AllySystem";
import { LocationSystem } from "../../../common/src/systems/LocationSystem";
import { VisiblitySystem } from "../../../common/src/systems/VisibilitySystem";
import { Point } from "../../../common/src/types/Points";
import { Tile } from "../../../common/src/types/Tile";
import { BresenhamCircle, BresenhamRayCast } from "../utils/Bresenham";

export class ServerVisbilitySystem extends VisiblitySystem {
    constructor(entityManager: EntityManager, allySystem: AllySystem, locationSystem: LocationSystem, private dungeon: Dungeon) {
        super(entityManager, allySystem, locationSystem, dungeon.size);

        locationSystem.componentUpdatedEmitter.subscribe((data) => {
            this.recalculateVisibility(data.id);
        });
        locationSystem.addedComponentEmitter.subscribe((data) => {
            this.recalculateVisibility(data.id);
        });
    }

    addComponentForEntity(id: number, component: VisiblityComponent): void {
        super.addComponentForEntity(id, component);
        this.recalculateVisibility(id);
    }

    getSeenTilesForEntity(entityId: number): Tile[] | undefined {
        const component = this.getSharedVisibilityComponent(entityId);
        if (!component) {
            return;
        }
        const seen: Tile[] = [];
        for(let x = 0; x < component.seen.length; x++) {
            for(let y = 0; y < component.seen.length; y++) {
                if (!component.seen[x][y]) {
                    continue;
                }

                const tile = this.dungeon.tiles[x]?.[y];
                if (tile) {
                    seen.push(tile);
                }
            }
        }
        return seen;
    }

    recalculateVisibility(entityId: number): void {
        const component: VisiblityComponent = this.getComponent(entityId);
        if (!component) {
            return;
        }
        
        // requires a location component to recalculate the visiblity
        const locationComponent: LocationComponent = this.locationSystem.getComponent(entityId);
        if (!locationComponent) {
            return;
        }

        const sharedComponent = this.getSharedVisibilityComponent(entityId);

        if (!sharedComponent) {
            return;
        }

        const outerVision = BresenhamCircle(locationComponent.location, component.sightRadius);
        const newVision: Record<number, Record<number, boolean>> = {};
        const currentVision = component.visible;
        const toDelete: Point[] = [];
        const toAdd: Point[] = [];
        const newSeen: Tile[] = [];

        // Always add the location point - can always see self
        if (!newVision[locationComponent.location.x]) {
            newVision[locationComponent.location.x] = {};
        }
        if (!currentVision[locationComponent.location.x]?.[locationComponent.location.y]) {
            toAdd.push(locationComponent.location);
        } else {
            delete currentVision[locationComponent.location.x]?.[locationComponent.location.y];
        }

        if (!sharedComponent.seen[locationComponent.location.x][locationComponent.location.y]) {
            sharedComponent.seen[locationComponent.location.x][locationComponent.location.y] = true;
            newSeen.push(this.dungeon.tiles[locationComponent.location.x][locationComponent.location.y]);
        }
        newVision[locationComponent.location.x][locationComponent.location.y] = true;

        for(let i = 0; i < outerVision.length; i++) { 
            const point = outerVision[i];
            BresenhamRayCast({x: locationComponent.location.x, y: locationComponent.location.y}, point, (bPoint) => {
                // skip the first point - already added it above, and it will get added for every point in the outer circle
                // or skip it if we've already added it
                if ((bPoint.x === locationComponent.location.x && bPoint.y === locationComponent.location.y)) {
                    return true;
                }

                if (!newVision[bPoint.x]) {
                    newVision[bPoint.x] = {};
                }

                if (!currentVision[bPoint.x]?.[bPoint.y] && !newVision[bPoint.x]?.[bPoint.y]) {
                    toAdd.push(bPoint);
                } else {
                    delete currentVision[bPoint.x]?.[bPoint.y];
                }

                newVision[bPoint.x][bPoint.y] = true;
                if (!sharedComponent.seen[bPoint.x][bPoint.y]) {
                    sharedComponent.seen[bPoint.x][bPoint.y] = true;
                    newSeen.push(this.dungeon.tiles[bPoint.x][bPoint.y]);
                }
                return !this.dungeon.tileBlocksVision(bPoint);
            });
        }

        for (let x in currentVision) {
            for(let y in currentVision[x]) {
                toDelete.push({ x: parseInt(x), y: parseInt(y)});
            }
        }
        component.visible = newVision;

        this.componentUpdatedEmitter.emit({id: entityId, props: { added: toAdd, removed: toDelete, seen: newSeen}, oldProps: {}});
    }

    toJSON(): any {
        return {
            entities: this.entities,
            sharedComponents: this.sharedComponents
        };
    }
}
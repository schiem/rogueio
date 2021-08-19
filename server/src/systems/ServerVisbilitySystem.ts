import { LocationComponent } from "../../../common/src/components/LocationComponent";
import { VisiblityComponent, SharedVisibilityComponent } from "../../../common/src/components/VisibilityComponent";
import { EntityManager } from "../../../common/src/entities/EntityManager";
import { Dungeon } from "../../../common/src/models/Dungeon";
import { LocationSystem } from "../../../common/src/systems/LocationSystem";
import { VisiblitySystem } from "../../../common/src/systems/VisibilitySystem";
import { Point } from "../../../common/src/types/Points";
import { BresenhamCircle, BresenhamRayCast } from "../utils/Bresenham";

export class ServerVisbilitySystem extends VisiblitySystem {
    constructor(entityManager: EntityManager, locationSystem: LocationSystem, private dungeon: Dungeon) {
        super(entityManager, locationSystem, dungeon.size);

        locationSystem.locationAddedEmitter.subscribe((data) => {
            const d = new Date();
            this.recalculateVisibility(data.id);
            console.log(new Date().getTime() - d.getTime());
        });
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

        const sharedComponent: SharedVisibilityComponent = this.sharedComponents[component.sharedComponentId];

        const outerVision = BresenhamCircle(locationComponent.location, component.sightRadius);
        const newVision: Record<number, Record<number, boolean>> = {};
        const currentVision = component.visible;
        const toDelete: Point[] = [];
        const toAdd: Point[] = [];
        const newSeen: Point[] = [];

        // Always add the location point - can always see self
        if (!newVision[locationComponent.location.x]) {
            newVision[locationComponent.location.x] = {};
        }
        if (!currentVision[locationComponent.location.x]?.[locationComponent.location.y]) {
            toAdd.push(locationComponent.location);
        } else {
            delete currentVision[locationComponent.location.x]?.[locationComponent.location.y];
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
                if (!currentVision[bPoint.x]?.[bPoint.y]) {
                    toAdd.push(bPoint);
                } else {
                    delete currentVision[bPoint.x]?.[bPoint.y];
                }
                newVision[bPoint.x][bPoint.y] = true;
                if (!sharedComponent.seen[bPoint.x][bPoint.y]) {
                    sharedComponent.seen[bPoint.x][bPoint.y] = true;
                    newSeen.push(bPoint);
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

        this.visionChangedEmitter.emit({id: entityId, added: toAdd, removed: toDelete, seenAdded: newSeen});
    }

    toJSON(): any {
        return {
            entities: this.entities,
            sharedComponents: this.sharedComponents
        };
    }
}
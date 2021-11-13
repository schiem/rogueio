import { ActionTarget } from "../../../common/src/components/ActionComponent";
import { EntityManager } from "../../../common/src/entities/EntityManager";
import { Dungeon } from "../../../common/src/models/Dungeon";
import { ActionSystem } from "../../../common/src/systems/ActionSystem";
import { LocationSystem } from "../../../common/src/systems/LocationSystem";
import { VisibilitySystem } from "../../../common/src/systems/VisibilitySystem";
import { Point } from "../../../common/src/types/Points";
import { pointDistanceSquared } from "../../../common/src/utils/PointUtils";
import { BresenhamRayCast } from "../utils/Bresenham";

export class ServerActionSystem extends ActionSystem {
    constructor(entityManager: EntityManager, private locationSystem: LocationSystem, private visibilitySystem: VisibilitySystem, private dungeon: Dungeon) {
        super(entityManager);
    }

    doAction(entityId: number, actionId: number, target: number | Point | undefined): void {
        const component = this.getComponent(entityId);
        if(!component) {
            return;
        }

        const action = component.actions[actionId];
        if(!action) {
            return;
        }
        const entitiesToApplyTo = [];
        switch (action.targetType.target) {
            case ActionTarget.entity:
                if (typeof target !== 'number' || !this.validateTarget(entityId, target, action.range)) {
                    return;
                }
                entitiesToApplyTo.push(target);
                break;
            case ActionTarget.circle:
                if (typeof target !== 'object' || !this.validateTarget(entityId, target, action.targetType.radius)) {
                    return;
                }
                break;
            case ActionTarget.line:
                if (typeof target !== 'object' || !this.validateTarget(entityId, target, action.range)) {
                    return;
                }
                break;
            case ActionTarget.self:
                entitiesToApplyTo.push(entityId);
                break;
        }
    }

    fetchEntitiesForArea(point: Point, radius: number): number[] {
        const entities: number[] = [];

        return entities;
    }

    validateTarget(entityId: number, target: number | Point, range: number): boolean {
        let point: Point;
        if (typeof target === 'number') {

            const targetLocation = this.locationSystem.getComponent(target);
            if (!targetLocation) {
                return false;
            } 
            point = targetLocation.location;
        } else {
            point = target
        }
        
        const locationComponent = this.locationSystem.getComponent(entityId);
        if (!locationComponent) {
            return false;
        }

        // Out of range
        if (pointDistanceSquared(locationComponent.location, point) > (range * range)) {
            return false;
        }

        const visibilityComponent = this.visibilitySystem.getComponent(entityId);
        // Ensure that this specific entity (not an ally) can see the target
        // Already have visibility calculated - just use that
        if (visibilityComponent && this.visibilitySystem.tileIsVisible(entityId, point)) {
            return true;
        }

        // Check if we can cast to this tile
        const blocked = BresenhamRayCast(locationComponent.location, point, (bPoint) => {
            return this.dungeon.tileBlocksVision(bPoint);
        });
        return !blocked;
    }
}
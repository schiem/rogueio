import { MovementComponent } from "../../../common/src/components/MovementComponent";
import { EntityManager } from "../../../common/src/entities/EntityManager";
import { Dungeon } from "../../../common/src/models/Dungeon";
import { LocationSystem } from "../../../common/src/systems/LocationSystem";
import { MovementSystem } from "../../../common/src/systems/MovementSystem";
import { Point } from "../../../common/src/types/Points";
import { clamp } from "../../../common/src/utils/MathUtils";

export class ServerMovementSystem extends MovementSystem {
    constructor(entityManager: EntityManager, public locationSystem: LocationSystem) {
        super(entityManager);
    }

    attemptMove(id: number, direction: Point, dungeon: Dungeon, currentTime: number): boolean {
        const component = this.getComponent(id);
        if (component === undefined) {
            return false;
        }

        const locationComponent = this.locationSystem.getComponent(id);
        if (!locationComponent?.location) {
            this.removeComponentFromEntity(id);
            return false;
        }

        direction.x = clamp(direction.x, -1, 1);
        direction.y = clamp(direction.y, -1, 1);
        const newLocation = { x: locationComponent.location.x + direction.x, y: locationComponent.location.y + direction.y };
        if (this.moveOnCooldown(component, currentTime)) {
            return false;
        }

        const didMove = this.locationSystem.moveAndCollideEntity(id, newLocation, dungeon);
        if (didMove) {
            component.lastMoveTime = currentTime;
        }
        return didMove;
    }

    moveOnCooldown(component: MovementComponent, currentTime: number): boolean {
        return component.lastMoveTime !== undefined && (currentTime - component.lastMoveTime) < component.minMovementDelay;
    }
}
import { MovementComponent } from "../components/MovementComponent";
import { EntityManager } from "../entities/EntityManager";
import { Dungeon } from "../models/Dungeon";
import { Point } from "../types/Points";
import { clamp } from "../utils/MathUtils";
import { ComponentSystem, ReplicationMode } from "./ComponentSystem";
import { LocationSystem } from "./LocationSystem";

export class MovementSystem extends ComponentSystem<MovementComponent> {
    replicationMode: ReplicationMode = 'visible';

    constructor(entityManager: EntityManager, public locationSystem: LocationSystem) {
        super(entityManager);
    }

    attemptMove(id: number, direction: Point, dungeon: Dungeon, currentTime: number): boolean {
        const component = this.getComponent(id);
        if (component === undefined) {
            return false;
        }

        const locationComponent = this.locationSystem.getComponent(id);
        if (locationComponent === undefined) {
            this.removeComponentFromEntity(id);
            return false;
        }

        direction.x = clamp(direction.x, -1, 1);
        direction.y = clamp(direction.y, -1, 1);
        const newLocation = { x: locationComponent.location.x + direction.x, y: locationComponent.location.y + direction.y };
        if (this.moveOnCooldown(component, currentTime)) {
            console.log(component.lastMoveTime);
            console.log(currentTime);
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
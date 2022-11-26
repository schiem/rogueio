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

    attemptMove(id: number, direction: Point, dungeon: Dungeon): boolean {
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
        const now = new Date().getTime();
        const enoughTimeElapsed = component.lastMoveTime === undefined || now - component.lastMoveTime > component.minMovementDelay;
        if (!enoughTimeElapsed) {
            return false;
        }

        const didMove = this.locationSystem.moveAndCollideEntity(id, newLocation, dungeon);
        if (didMove) {
            component.lastMoveTime = now;
        }
        return didMove;
    }
}
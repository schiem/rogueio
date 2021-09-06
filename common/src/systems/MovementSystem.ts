import { LocationComponent } from "../components/LocationComponent";
import { MovementComponent } from "../components/MovementComponent";
import { EntityManager } from "../entities/EntityManager";
import { Dungeon } from "../models/Dungeon";
import { Point } from "../types/Points";
import { clamp } from "../utils/MathUtils";
import { ComponentSystem, ReplicationMode } from "./ComponentSystem";
import { LocationSystem } from "./LocationSystem";

export class MovementSystem extends ComponentSystem<MovementComponent> {
    replicationMode: ReplicationMode = 'visible';

    constructor(public locationSystem: LocationSystem, entityManager: EntityManager) {
        super(entityManager);
    }

    attemptMove(id: number, direction: Point, dungeon: Dungeon): void {
        const component: MovementComponent = this.getComponent(id);
        if (component === undefined) {
            return;
        }

        const locationComponent: LocationComponent = this.locationSystem.getComponent(id);
        if (locationComponent === undefined) {
            this.removeComponentFromEntity(id);
            return;
        }

        direction.x = clamp(direction.x, -1, 1);
        direction.y = clamp(direction.y, -1, 1);
        const newLocation = { x: locationComponent.location.x + direction.x, y: locationComponent.location.y + direction.y };
        const now = new Date().getTime();
        const enoughTimeElapsed = component.lastMoveTime === undefined || now - component.lastMoveTime > component.minMovementDelay;
        if (!enoughTimeElapsed || !this.locationSystem.canMoveTo(locationComponent, newLocation, dungeon)) {
            return;
        }

        const didMove = this.locationSystem.moveAndCollideEntity(id, newLocation, dungeon);
        if (didMove) {
            component.lastMoveTime = now;
        }
    }

    postDeserialize(): void {}

    toJSON(): any {
        return {
            entities: this.entities
        };
    }

}
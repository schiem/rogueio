import { pointDistance } from "../../../../../common/src/types/Points";
import { BTState, BTBlackboard } from "../../BehaviorTree";
import { ActionNode } from "./ActionNode";

export class MoveAwayFrom extends ActionNode {
    *execute(state: BTState, blackboard: BTBlackboard): Generator<void, boolean, unknown> {
        const moveComponent = state.systems.movement.getComponent(state.id);
        const locationComponent = state.systems.location.getComponent(state.id);
        if (!moveComponent || !blackboard.target || !locationComponent) {
            return false;
        }

        const location = locationComponent.location;
        const targetLocation = state.systems.location.getComponent(blackboard.target);
        if (!targetLocation) {
            return false;
        }

        // Can't move this tick, wait until the next tick
        while (state.systems.movement.moveOnCooldown(moveComponent, state.currentTime)) {
            yield;
        }

        const originalDistance = pointDistance(location, targetLocation.location);
        const bestMove = [
            {x: -1, y: 0 },
            {x: 1, y: 0},
            {x: 0, y: -1 },
            {x: 0, y: 1 },
        ].find((point) => {
            const newPoint = { x: location.x + point.x, y: location.y + point.y };
            if (!state.systems.location.canMoveTo(locationComponent, newPoint, state.dungeon)) {
                return false;
            }
            return pointDistance(newPoint, targetLocation.location) > originalDistance;
        });

        if (!bestMove) {
            return false;
        }

        return state.systems.movement.attemptMove(state.id, bestMove, state.dungeon, state.currentTime);
    }
}
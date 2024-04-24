import { addPoints, pointDistance } from "../../../../../common/src/types/Points";
import { randomList } from "../../../../../common/src/utils/MathUtils";
import { BTState, BTBlackboard } from "../../BehaviorTree";
import { ActionNode } from "./ActionNode";

export class MoveTowardNode extends ActionNode {
    *execute(state: BTState, blackboard: BTBlackboard): Generator<void, boolean, unknown> {
        const moveComponent = state.systems.movement.getComponent(state.id);
        const locationComponent = state.systems.location.getComponent(state.id);
        if (!moveComponent || !locationComponent) {
            return false;
        }

        // Can't move this tick, wait until the next tick
        while (state.systems.movement.moveOnCooldown(moveComponent, state.currentTime)) {
            yield;
        }

        const location = locationComponent.location;
        const possibleMoves = [
            {x: -1, y: 0 },
            {x: 1, y: 0},
            {x: 0, y: -1 },
            {x: 0, y: 1 },
        ].filter(x => state.systems.location.canMoveTo(locationComponent, addPoints(location, x), state.dungeon));

        if (possibleMoves.length === 0) {
            return false;
        }

        if (!blackboard.target) {
            return state.systems.movement.attemptMove(state.id, randomList(possibleMoves), state.dungeon, state.currentTime);
        }

        const targetLocation = state.systems.location.getComponent(blackboard.target);
        if (!targetLocation) {
            return false;
        }

        const originalDistance = pointDistance(location, targetLocation.location);
        const bestMove = possibleMoves.find((point) => {
            return pointDistance(addPoints(location, point), targetLocation.location) < originalDistance;
        });

        if (!bestMove) {
            return false;
        }

        return state.systems.movement.attemptMove(state.id, bestMove, state.dungeon, state.currentTime);
    }
}
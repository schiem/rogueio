import { pointDistance } from "../../../../../common/src/types/Points";
import { BTState, BTBlackboard } from "../../BehaviorTree";
import { ConditionNode } from "./ConditionNode";

export class CanRunAwayNode extends ConditionNode {
    *execute(state: BTState, blackboard: BTBlackboard): Generator<void, boolean, unknown> {
        const locationComponent = state.systems.location.getComponent(state.id);
        if (!blackboard.target || !locationComponent) {
            return false;
        }
        const location = locationComponent.location;
        const enemyLocation = state.systems.location.getComponent(blackboard.target)?.location;
        if (!enemyLocation) {
            return false;
        }

        const originalDistance = pointDistance(location, enemyLocation);

        // Check if any of the immediate surrounding tiles are further away
        // This is a dumb way of doing this and will result in very easy to trap AI
        return [
            {x: location.x - 1, y: location.y },
            {x: location.x + 1, y: location.y },
            {x: location.x, y: location.y - 1 },
            {x: location.x, y: location.y + 1 },
        ].some((newPoint) => {
            if (!state.systems.location.canMoveTo(locationComponent, newPoint, state.dungeon)) {
                return false;
            }
            return pointDistance(newPoint, enemyLocation) < originalDistance;
        });
    }
}
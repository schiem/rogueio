import { BresenhamRayCast } from "../../../utils/Bresenham";
import { BTState, BTBlackboard } from "../../BehaviorTree";
import { ConditionNode } from "./ConditionNode";

export class CanMoveToTargetNode extends ConditionNode {
    *execute(state: BTState, blackboard: BTBlackboard): Generator<void, boolean, unknown> {
        const locationComponent = state.systems.location.getComponent(state.id);
        if (!blackboard.target || !locationComponent) {
            return false;
        }
        const location = locationComponent.location;
        const targetLocation = state.systems.location.getComponent(blackboard.target)?.location;
        if (!targetLocation) {
            return false;
        }

        return !BresenhamRayCast(location, targetLocation, (point) => state.systems.location.canMoveTo(locationComponent, point, state.dungeon));
    }
}
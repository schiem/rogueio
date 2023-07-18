import { EffectType } from "../../../../../common/src/components/ActionComponent";
import { pointDistance } from "../../../../../common/src/types/Points";
import { BTState, BTBlackboard } from "../../BehaviorTree";
import { ConditionNode } from "./ConditionNode";

export class NextToTargetNode extends ConditionNode {
    *execute(state: BTState, blackboard: BTBlackboard): Generator<void, boolean, unknown> {
        const location = state.systems.location.getComponent(state.id)?.location;
        const actionComponent = state.systems.action.getComponent(state.id);
        const attack = actionComponent?.actions.find(x => x.effects.find(y => y.type === EffectType.attack));
        if (!blackboard.target || !location || !attack) {
            return false;
        }
        const targetLocation = state.systems.location.getComponent(blackboard.target)?.location;
        if (!targetLocation) {
            return false;
        }

        return attack.range <= pointDistance(location, targetLocation);
    }
}
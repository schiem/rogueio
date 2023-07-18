import { EffectType } from "../../../../../common/src/components/ActionComponent";
import { pointDistance } from "../../../../../common/src/types/Points";
import { BTState, BTBlackboard } from "../../BehaviorTree";
import { ConditionNode } from "./ConditionNode";

export class CanAttackEnemyNode extends ConditionNode {
    *execute(state: BTState, blackboard: BTBlackboard): Generator<void, boolean, unknown> {
        const locationComponent = state.systems.location.getComponent(state.id);
        const actionComponent = state.systems.action.getComponent(state.id);
        const attackAction = actionComponent?.actions.find(x => x.effects.find(y => y.type === EffectType.attack));
        const location = locationComponent?.location;
        if (!blackboard.target || !location || !attackAction) {
            return false;
        }
        const enemyLocation = state.systems.location.getComponent(blackboard.target)?.location;
        if (!enemyLocation) {
            return false;
        }

        return pointDistance(location, enemyLocation) <= attackAction.range;
    }
}
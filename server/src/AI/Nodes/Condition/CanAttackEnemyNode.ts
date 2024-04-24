import { EffectType } from "../../../../../common/src/components/ActionComponent";
import { BTState, BTBlackboard } from "../../BehaviorTree";
import { ConditionNode } from "./ConditionNode";

export class CanAttackEnemyNode extends ConditionNode {
    *execute(state: BTState, blackboard: BTBlackboard): Generator<void, boolean, unknown> {
        const actionComponent = state.systems.action.getComponent(state.id);
        const attackAction = actionComponent?.actions.find(x => x.effects.find(y => y.type === EffectType.attack));
        if (!blackboard.target || !attackAction) {
            return false;
        }

        return state.systems.action.validateTarget(state.id, blackboard.target, attackAction.range);
    }
}
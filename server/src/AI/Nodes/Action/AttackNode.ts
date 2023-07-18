import { EffectType } from "../../../../../common/src/components/ActionComponent";
import { BTState, BTBlackboard } from "../../BehaviorTree";
import { ActionNode } from "./ActionNode";

export class AttackNode extends ActionNode {
    *execute(state: BTState, blackboard: BTBlackboard): Generator<void, boolean, unknown> {
        const locationComponent = state.systems.location.getComponent(state.id);
        const actionComponent = state.systems.action.getComponent(state.id);
        const location = locationComponent?.location;
        if (!blackboard.target || !location || !actionComponent) {
            return false;
        }

        const attackActionIndex = actionComponent?.actions.findIndex(x => x.effects.find(y => y.type === EffectType.attack));
        if (attackActionIndex === -1) {
            return false;
        }

        while (state.systems.action.actionOnCooldown(actionComponent?.actions[attackActionIndex], state.currentTime)) {
            yield;
        }

        return state.systems.action.attemptAction(state.id, attackActionIndex, blackboard.target, state.currentTime);
    }
}
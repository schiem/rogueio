import { BTState, BTBlackboard } from "../../BehaviorTree";
import { ConditionNode } from "./ConditionNode";

export class HealthIsLowNode extends ConditionNode {
    *execute(state: BTState, blackboard: BTBlackboard): Generator<void, boolean, unknown> {
        const healthComponent = state.systems.health.getComponent(state.id);
        if (!healthComponent) {
            return false;
        }

        return (healthComponent.current / healthComponent.max) < 0.3;
    }
}
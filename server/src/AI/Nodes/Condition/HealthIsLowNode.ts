import { BTState, BTBlackboard } from "../../BehaviorTree";
import { ConditionNode } from "./ConditionNode";

export class HealthIsLowNode extends ConditionNode {
    *execute(state: BTState, blackboard: BTBlackboard): Generator<void, boolean, unknown> {
        const healthComponent = state.systems.health.getComponent(state.id);
        if (!healthComponent) {
            return false;
        }

        console.log(healthComponent.current);
        console.log(healthComponent.max);
        return (healthComponent.current / healthComponent.max) < 0.3;
    }
}
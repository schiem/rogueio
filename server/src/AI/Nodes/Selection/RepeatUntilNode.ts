import { BTState, BTBlackboard } from "../../BehaviorTree";
import { ActionNode } from "../Action/ActionNode";
import { BTNode } from "../BTNode";
import { ConditionNode } from "../Condition/ConditionNode";

export class RepeatUntilNode extends BTNode {
    /**
     *
     */
    constructor(private action: ActionNode, private condition: ConditionNode) {
        super();
    }
    *execute(state: BTState, blackboard: BTBlackboard): Generator<void, boolean, unknown> {
        let condition = false;

        // Repeat the action until the condition evaluates to true
        while (!condition) {
            // Perform the action
            const actionGenerator = this.action.execute(state, blackboard);

            // Wait until the action has completed
            let response = actionGenerator.next();
            while (!response.done) {
                yield;
                response = actionGenerator.next();
            }

            // If the action failed, bail early
            if (!response.value) {
                return false;
            }

            // Perform the condition, if it passes then we're done
            const conditionGenerator = this.condition.execute(state, blackboard);
            let conditionResponse = conditionGenerator.next();
            while (!conditionResponse.done) {
                yield;
                conditionResponse = conditionGenerator.next();
            }

            condition = conditionResponse.value;
        }

        return true;
    }
}
import { BTState, BTBlackboard } from "../BehaviorTree";

export abstract class BTNode {
    abstract execute(state: BTState, blackboard: BTBlackboard): Generator<void, boolean, unknown>;
}
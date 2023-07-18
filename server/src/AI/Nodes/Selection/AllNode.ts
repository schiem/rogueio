import { BTBlackboard, BTState } from "../../BehaviorTree";
import { BTNode } from "../BTNode";

export class AllNode extends BTNode {
    constructor(
        private children: BTNode[]
    ) {
        super();
        
    }

    *execute(state: BTState, blackboard: BTBlackboard): Generator<void, boolean, unknown> {
        for (let i = 0; i < this.children.length; i++) {
            const generator = this.children[i].execute(state ,blackboard);
            let generatorResponse = generator.next();
            while (!generatorResponse.done) {
                // The current node that we're looking at has done all that it can this frame.
                // Yield until the next frame, then tell that node to continue.
                yield;
                generatorResponse = generator.next();
            }

            if (!generatorResponse.value) {
                return false;
            }
        }

        return true;
    }
}
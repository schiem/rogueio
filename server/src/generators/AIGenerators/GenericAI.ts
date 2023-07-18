import { BehaviorTree } from "../../AI/BehaviorTree";
import { AttackNode } from "../../AI/Nodes/Action/AttackNode";
import { MoveAwayFrom } from "../../AI/Nodes/Action/MoveAwayFrom";
import { MoveTowardNode } from "../../AI/Nodes/Action/MoveTowardNode";
import { BTNode } from "../../AI/Nodes/BTNode";
import { CanAttackEnemyNode } from "../../AI/Nodes/Condition/CanAttackEnemyNode";
import { CanRunAwayNode } from "../../AI/Nodes/Condition/CanRunAwayNode";
import { CanSeeEnemyNode } from "../../AI/Nodes/Condition/CanSeeTargetNode";
import { HealthIsLowNode } from "../../AI/Nodes/Condition/HealthIsLowNode";
import { AllNode } from "../../AI/Nodes/Selection/AllNode";
import { AnyNode } from "../../AI/Nodes/Selection/AnyNode";
import { RepeatUntilNode } from "../../AI/Nodes/Selection/RepeatUntilNode";
import { AIComponent } from "../../components/AIComponent";

export const generateGenericAttackAI = (): BTNode => {
    return new AnyNode([
        new AllNode([
            new CanAttackEnemyNode(),
            new AttackNode()
        ]),
        new AllNode([
            new RepeatUntilNode(
                new MoveTowardNode(),
                new CanAttackEnemyNode()
            ),
            new AttackNode()
        ])
    ])
}

/**
 *  
 */
export const generateGenericAI = (): AIComponent => {
    return {
        tree: new BehaviorTree(
            new AnyNode([
                new AllNode([
                    new CanSeeEnemyNode(),
                    new AnyNode([
                        //Flee
                        new AllNode([
                            new HealthIsLowNode(),
                            new CanRunAwayNode(),
                            new MoveAwayFrom()
                        ]),

                        //Attack
                        generateGenericAttackAI()
                    ])
                ]),
                //Randomly move
                new MoveTowardNode()
            ])
        )
    }
}
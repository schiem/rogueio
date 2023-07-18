import { pointDistanceSquared } from "../../../../../common/src/types/Points";
import { BresenhamRayCast } from "../../../utils/Bresenham";
import { BTBlackboard, BTState } from "../../BehaviorTree";
import { ConditionNode } from "./ConditionNode";

export class CanSeeEnemyNode extends ConditionNode {
    *execute(state: BTState, blackboard: BTBlackboard): Generator<void, boolean, unknown> {
        const enemies = state.systems.ally.getEnemiesForEntity(state.id);
        const location = state.systems.location.getComponent(state.id)?.location;
        if (!enemies?.length || !location) {
            return false;
        }

        // For now, just raycast some distance - this is a "temporary hack" that definitely will get changed ;)
        for (let i = 0; i < enemies.length; i++) {
            const targetId = enemies[i];
            const targetLocation = state.systems.location.getComponent(targetId)?.location;
            if (!targetLocation || pointDistanceSquared(location, targetLocation) > Math.pow(10, 2)) {
                continue;
            }

            // If vision isn't obstructed, the target is visible
            if(!BresenhamRayCast(location, targetLocation, (point) => state.dungeon.tileBlocksVision(point))) {
                blackboard.target = targetId;
                return true;
            }
        }
        
        return false;
    }
}
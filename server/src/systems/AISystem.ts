import { AIComponent, AIFunctions } from "../components/AIComponent";
import { ComponentSystem, ReplicationMode } from "../../../common/src/systems/ComponentSystem";
import { ServerGameSystems } from "../models/ServerGame";
import { Dungeon } from "../../../common/src/models/Dungeon";

export class AISystem extends ComponentSystem<AIComponent> {
    replicationMode: ReplicationMode = 'none';

    runAI(delta: number, systems: ServerGameSystems, dungeon: Dungeon): void {
        for(let key in this.entities) {
            const entityId =  key as unknown as number;
            const component = this.getComponent(entityId);
            if (!component) {
                continue;
            }

            const aiType = component.type;
            const aiFunction = AIFunctions[aiType];
            aiFunction(entityId, component, systems, dungeon);
        }
    }
}
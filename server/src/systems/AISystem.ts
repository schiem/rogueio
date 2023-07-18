import { AIComponent } from "../components/AIComponent";
import { ComponentSystem, ReplicationMode } from "../../../common/src/systems/ComponentSystem";
import { ServerGameSystems } from "../models/ServerGame";
import { ServerDungeon } from "../models/ServerDungeon";

export class AISystem extends ComponentSystem<AIComponent> {
    replicationMode: ReplicationMode = 'none';

    runAI(currentTime: number, systems: ServerGameSystems, dungeon: ServerDungeon): void {
        for(let key in this.entities) {
            const entityId =  parseInt(key);
            const component = this.getComponent(entityId);
            if (!component) {
                continue;
            }

            component.tree.run(currentTime, systems, dungeon, entityId);
        }
    }
}
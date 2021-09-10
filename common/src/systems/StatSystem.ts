import { StatComponent } from "../components/StatComponent";
import { ComponentSystem, ReplicationMode } from "./ComponentSystem";
export class StatSystem extends ComponentSystem<StatComponent> {
    replicationMode: ReplicationMode = 'ally';

    toJSON() {
        return {
            entities: this.entities
        }
    }
}
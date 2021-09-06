import { StatComponent } from "../components/StatComponent";
import { EntityManager } from "../entities/EntityManager";
import { ComponentSystem, ReplicationMode } from "./ComponentSystem";
export class StatSystem extends ComponentSystem<StatComponent> {
    replicationMode: ReplicationMode = 'ally';

    postDeserialize(): void {}

    toJSON() {
        return this;
    }
}
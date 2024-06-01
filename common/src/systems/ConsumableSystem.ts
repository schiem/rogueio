import { ConsumableComponent } from "../components/ConsumableComponent";
import { ComponentSystem, ReplicationMode } from "./ComponentSystem";

export class ConsumableSystem extends ComponentSystem<ConsumableComponent> {
    replicationMode: ReplicationMode = 'visible';
}
import { EquippableComponent } from "../components/EquippableComponent";
import { ComponentSystem, ReplicationMode } from "./ComponentSystem";

export class EquippableSystem extends ComponentSystem<EquippableComponent> {
    replicationMode: ReplicationMode = 'visible';
}
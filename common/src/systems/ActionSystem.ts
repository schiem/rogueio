import { ActionComponent } from "../components/ActionComponent";
import { ComponentSystem, ReplicationMode } from "./ComponentSystem";

export class ActionSystem extends ComponentSystem<ActionComponent> {
    replicationMode: ReplicationMode = 'self';
}
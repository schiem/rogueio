import { MovementComponent } from "../components/MovementComponent";
import { ComponentSystem, ReplicationMode } from "./ComponentSystem";

export class MovementSystem extends ComponentSystem<MovementComponent> {
    replicationMode: ReplicationMode = 'visible';
}
import { CarryableComponent } from "../components/CarryableComponent";
import { ComponentSystem, ReplicationMode } from "./ComponentSystem"

export class CarryableSystem extends ComponentSystem<CarryableComponent>{
    replicationMode: ReplicationMode = 'visible';
}
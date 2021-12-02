import { DescriptionComponent } from "../components/DescriptionComponent";
import { ComponentSystem, ReplicationMode } from "./ComponentSystem";

export class DescriptionSystem extends ComponentSystem<DescriptionComponent> {
    replicationMode: ReplicationMode = 'visible';
}
import { SpriteComponent } from "../components/SpriteComponent";
import { ComponentSystem, ReplicationMode } from "./ComponentSystem";

export class SpriteSystem extends ComponentSystem<SpriteComponent> {
    replicationMode: ReplicationMode = 'visible';
}
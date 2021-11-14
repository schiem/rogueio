import { HealthComponent } from "../components/HealthComponent";
import { EntityManager } from "../entities/EntityManager";
import { ComponentSystem, ReplicationMode } from "./ComponentSystem";

export class HealthSystem extends ComponentSystem<HealthComponent> {
    replicationMode: ReplicationMode = 'visible';

    constructor(entityManager: EntityManager) {
        super(entityManager)

        this.componentUpdatedEmitter.subscribe((data) => {
            if (data.props.health) {
                // Oh dear, the player has died
                if (data.props.health <= 0) {
                    this.removeComponentFromEntity(data.id);
                }
            } 
        });
    }
}
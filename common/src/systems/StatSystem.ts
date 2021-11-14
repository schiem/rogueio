import { StatComponent } from "../components/StatComponent";
import { EntityManager } from "../entities/EntityManager";
import { ComponentSystem, ReplicationMode } from "./ComponentSystem";
import { HealthSystem } from "./HealthSystem";
export class StatSystem extends ComponentSystem<StatComponent> {
    replicationMode: ReplicationMode = 'ally';

    constructor(entityManager: EntityManager, healthSystem: HealthSystem) {
        super(entityManager);

        healthSystem.removedComponentEmitter.subscribe((data) => {
            if (entityManager.hasEntity(data.id)) {
                this.removeComponentFromEntity(data.id);
            }
        });
    }
}
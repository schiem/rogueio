import { HealthComponent } from "../components/HealthComponent";
import { EntityManager } from "../entities/EntityManager";
import { ComponentSystem, ReplicationMode } from "./ComponentSystem";

export class HealthSystem extends ComponentSystem<HealthComponent> {
    replicationMode: ReplicationMode = 'visible';

    constructor(entityManager: EntityManager) {
        super(entityManager)
    }
}
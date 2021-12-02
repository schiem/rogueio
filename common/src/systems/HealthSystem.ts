import { HealthComponent } from "../components/HealthComponent";
import { EntityManager } from "../entities/EntityManager";
import { ComponentSystem, ReplicationMode } from "./ComponentSystem";

export class HealthSystem extends ComponentSystem<HealthComponent> {
    replicationMode: ReplicationMode = 'visible';

    constructor(entityManager: EntityManager) {
        super(entityManager)

        this.componentUpdatedEmitter.subscribe((data) => {
            if (data.props.current !== undefined) {
                const component = this.getComponent(data.id);
                if (!component) {
                    return;
                }
                // Oh dear, the entity has died
                if (component.current <= 0) {
                    this.removeComponentFromEntity(data.id);
                }
            } 
        });
    }
}
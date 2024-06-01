import { HealthSystem } from "../../../common/src/systems/HealthSystem";

export class ServerHealthSystem extends HealthSystem {

    heal(id: number, amount: number, didHeal?: number): void {
        const healthComponent = this.getComponent(id);
        if (!healthComponent) {
            return;
        }

        const newHealth = Math.min(healthComponent.current + amount, healthComponent.max);
        this.updateComponent(id, {
            current: newHealth
        }, didHeal);
    }

    damage(id: number, amount: number, didDamage: number): void {
        const healthComponent = this.getComponent(id);
        if (!healthComponent) {
            return;
        }

        const newHealth = Math.max(healthComponent.current - amount, 0);
        this.updateComponent(id, {
            current: newHealth
        }, didDamage);
    }
}
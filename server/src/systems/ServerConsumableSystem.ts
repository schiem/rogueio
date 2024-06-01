import { ConsumableType } from "../../../common/src/components/ConsumableComponent";
import { EntityManager } from "../../../common/src/entities/EntityManager";
import { ConsumableSystem } from "../../../common/src/systems/ConsumableSystem";
import { InventorySystem } from "../../../common/src/systems/InventorySystem";
import { LocationSystem } from "../../../common/src/systems/LocationSystem";
import { pointDistance } from "../../../common/src/types/Points";
import { shuffleList } from "../../../common/src/utils/MathUtils";
import { ServerHealthSystem } from "./ServerHealthSystem";

export class ServerConsumableSystem extends ConsumableSystem {
    private consumableMap: Record<number, ConsumableType> = {};

    constructor(protected entityManager: EntityManager, private locationSystem: LocationSystem, private inventorySystem: InventorySystem, private healthSystem: ServerHealthSystem) {
        super(entityManager);

        // Produce a random map of number => consumable type
        // The number is what will actually be sent to the frontend.
        const values = Object.values(ConsumableType) as ConsumableType[];
        shuffleList(values);
        values.forEach((consumableType, i) => {
            this.consumableMap[i] = consumableType;
        });
    }

    attemptConsume(entityId: number, consumableId: number): boolean {
        const consumableComponent = this.getComponent(consumableId);
        if (!consumableComponent) {
            return false;
        }
        // Must either be within 1 tile, or carrying the item to use it
        const entityLocation = this.locationSystem.getComponent(entityId);
        const consumableLocation = this.locationSystem.getComponent(consumableId);
        if (entityLocation?.location && consumableLocation?.location && pointDistance(entityLocation.location, consumableLocation.location) > 1) {
            return false;
        }

        if (!this.inventorySystem.entityIsCarrying(entityId, consumableId)) {
            return false;
        }

        if (!this.entityCanConsume(entityId, consumableId)) {
            return false;
        }

        this.doConsumeAction(entityId, consumableId);

        const newUses = consumableComponent.uses - 1;
        this.updateComponent(consumableId, {
            uses: newUses
        }, entityId)

        // All consumed, remove it!
        if (newUses <= 0) {
            this.entityManager.removeEntity(consumableId);
        }
        return true;
    }

    private doConsumeAction(entityId: number, consumableId: number): void {
        const consumableComponent = this.getComponent(consumableId);
        if (!consumableComponent) {
            return;
        }

        const effect = consumableComponent.effect;
        switch (effect) {
            case ConsumableType.greaterHealing:
                this.healthSystem.heal(entityId, 10);
                break;
            case ConsumableType.lesserHealing:
                this.healthSystem.heal(entityId, 5);
                break;
            default:
                const exhaustiveCheck: never = effect;
                throw new Error(`Unhandled case: ${exhaustiveCheck}`);
        }
    }

    private entityCanConsume(entityId: number, consumableId: number): boolean {
        const consumableComponent = this.getComponent(consumableId);
        if (!consumableComponent) {
            return false;
        }

        const effect = consumableComponent.effect;
        switch (effect) {
            case ConsumableType.greaterHealing:
                return !!this.healthSystem.getComponent(entityId);
            case ConsumableType.lesserHealing:
                return !!this.healthSystem.getComponent(entityId);
            default:
                const exhaustiveCheck: never = effect;
                throw new Error(`Unhandled case: ${exhaustiveCheck}`);
        }
    }
}
import { ActionTarget, AttackEffect, Effect, EffectTarget, EffectType } from "../../../common/src/components/ActionComponent";
import { EntityManager } from "../../../common/src/entities/EntityManager";
import { Dungeon } from "../../../common/src/models/Dungeon";
import { ActionSystem } from "../../../common/src/systems/ActionSystem";
import { AllySystem } from "../../../common/src/systems/AllySystem";
import { HealthSystem } from "../../../common/src/systems/HealthSystem";
import { LocationSystem } from "../../../common/src/systems/LocationSystem";
import { VisibilitySystem } from "../../../common/src/systems/VisibilitySystem";
import { Point } from "../../../common/src/types/Points";
import { random } from "../../../common/src/utils/MathUtils";
import { pointDistanceSquared } from "../../../common/src/utils/PointUtils";
import { BresenhamRayCast } from "../utils/Bresenham";

export class ServerActionSystem extends ActionSystem {
    constructor(
        entityManager: EntityManager, 
        private locationSystem: LocationSystem, 
        private visibilitySystem: VisibilitySystem, 
        private allySystem: AllySystem, 
        private healthSystem: HealthSystem,
        private dungeon: Dungeon) {
        super(entityManager);
    }

    doAction(entityId: number, actionId: number, target: number | Point | undefined): void {
        const component = this.getComponent(entityId);
        if(!component) {
            return;
        }

        const action = component.actions[actionId];
        if(!action) {
            return;
        }
        let entitiesToApplyTo: number[];
        switch (action.targetType.target) {
            case ActionTarget.entity:
                if (typeof target !== 'number' || !this.validateTarget(entityId, target, action.range)) {
                    return;
                }
                entitiesToApplyTo = [target];
                break;
            case ActionTarget.circle:
                if (typeof target !== 'object' || !this.validateTarget(entityId, target, action.targetType.radius)) {
                    return;
                }
                entitiesToApplyTo = this.fetchEntitiesForCircle(target, action.targetType.radius);
                break;
            case ActionTarget.line:
                if (typeof target !== 'object' || !this.validateTarget(entityId, target, action.range)) {
                    return;
                }
                const location = this.locationSystem.getComponent(entityId);
                if (!location) {
                    return;
                }
                entitiesToApplyTo = this.fetchEntitiesForLine(location.location, target, action.targetType.length);
                break;
            case ActionTarget.self:
                entitiesToApplyTo = [entityId];
                break;
        }

        // Nothing to do, ignore it
        if (!entitiesToApplyTo.length) {
            return;
        }
        const affectedEntityCache: Partial<Record<EffectTarget, number[]>> = {};
        action.effects.forEach((effect) => {
            let affectedEntities: number[];
            const cached = affectedEntityCache[effect.target];
            if (cached !== undefined) {
                affectedEntities = cached;
            } else {
                affectedEntities = entitiesToApplyTo.filter((targetId) => {
                    return this.effectApplies(entityId, targetId, effect.target);
                });
            }

            if (affectedEntities.length) {
                this.applyEffect(affectedEntities, effect);
            }
        });
    }

    applyEffect(entities: number[], effect: Effect): void {
        switch(effect.type) {
            case EffectType.attack:
                const attackEffect = effect as AttackEffect;
                entities.forEach((entityId) => {
                    const healthComponent = this.healthSystem.getComponent(entityId);
                    if (!healthComponent) {
                        return;
                    }

                    const damage = random(attackEffect.damage.min, attackEffect.damage.max + 1);
                    this.healthSystem.updateComponent(entityId, { current: Math.max(healthComponent.current - damage, 0)})
                });
        }
    }
    
    effectApplies(entityId: number, targetId: number, effect: EffectTarget): boolean {
        switch(effect) {
            case EffectTarget.self:
                return entityId === targetId;
            case EffectTarget.ally:
                return this.allySystem.entitiesAreAllies(entityId, targetId); 
            case EffectTarget.enemy:
                // To be considered an enemy, it has to not be an ally, but be a part of an ally system
                return (!!this.allySystem.getComponent(targetId) && !this.allySystem.entitiesAreAllies(entityId, targetId));
        }
    }

    fetchEntitiesForLine(point: Point, towards: Point, length: number): number[] {
        const entities: number[] = [];
        // Can't be avoided, either need to use trig or sqrt
        const xDiff = point.x - towards.x;
        const yDiff = point.y - towards.y
        const hyp = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
        const ratio = length / hyp;

        // Will this always land us inside the originally selected point? - guess we'll find out
        const newPoint = {
            x: Math.round(xDiff * ratio),
            y: Math.round(yDiff * ratio)
        }
        BresenhamRayCast(point, newPoint, (p) => {
            entities.push(...this.locationSystem.getEntitiesAtLocation(p));
            return false;
        });
        return entities;
    }

    fetchEntitiesForCircle(point: Point, radius: number): number[] {
        const radSquared = radius * radius;
        const entities: number[] = [];

        for(let x = point.x - radius; x <= point.x + radius; x++) {
            for(let y = point.y - radius; y <= point.y + radius; y++) {
                const newPoint = {x, y};
                if (pointDistanceSquared(point, newPoint) > radSquared) {
                    continue;
                }
                entities.push(...this.locationSystem.getEntitiesAtLocation(newPoint));
            }
        }

        return entities;
    }

    validateTarget(entityId: number, target: number | Point, range: number): boolean {
        let point: Point;
        if (typeof target === 'number') {

            const targetLocation = this.locationSystem.getComponent(target);
            if (!targetLocation) {
                return false;
            } 
            point = targetLocation.location;
        } else {
            point = target
        }
        
        const locationComponent = this.locationSystem.getComponent(entityId);
        if (!locationComponent) {
            return false;
        }

        // Out of range
        if (pointDistanceSquared(locationComponent.location, point) > (range * range)) {
            return false;
        }

        const visibilityComponent = this.visibilitySystem.getComponent(entityId);
        // Ensure that this specific entity (not an ally) can see the target
        // Already have visibility calculated - just use that
        if (visibilityComponent && this.visibilitySystem.tileIsVisible(entityId, point)) {
            return true;
        }

        // Check if we can cast to this tile
        const blocked = BresenhamRayCast(locationComponent.location, point, (bPoint) => {
            return this.dungeon.tileBlocksVision(bPoint);
        });
        return !blocked;
    }
}
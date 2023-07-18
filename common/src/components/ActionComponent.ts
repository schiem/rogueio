// Action Target Data
export enum ActionTarget {
    self,
    entity,
    circle,
    line
}
type SelfAction = {
    target: ActionTarget.self;
};

type EntityAction = {
    target: ActionTarget.entity;
};

type CircleAction = {
    target: ActionTarget.circle
    radius: number
};

type LineAction = {
    target: ActionTarget.line
    length: number;
};


export enum EffectType {
    attack,
}
export enum EffectTarget {
    enemy,
    ally,
    self
}
export interface Effect {
    type: EffectType,
    target: EffectTarget
}
export interface AttackEffect extends Effect {
    type: EffectType.attack;
    damage: { min: number, max: number };
};


export type Action = {
    effects: Effect[];
    range: number;
    targetType: SelfAction | CircleAction | EntityAction | LineAction;
    cooldown: number;
    lastTime?: number;
};

export type ActionComponent = {
    actions: Action[];
}
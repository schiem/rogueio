export enum ActionTarget {
    self,
    entity,
    area
}

export enum EffectTarget {
    enemy,
    ally,
    self
}

export enum TargetShape {
    circle,
    square
}

type SelfAction = {
    target: ActionTarget.self;
};
type EntityAction = {
    target: ActionTarget.entity;
}
type AreaAction = {
    target: ActionTarget.area
    shape: TargetShape,
    targetRadius: number
};


export enum EffectType {
    attack,
}
export interface Effect {
}
export interface AttackEffect extends Effect {
    type: EffectType.attack;
    damage: { min: number, max: number };
    range: number;
};


export type Action = {
    effects: Effect[];
    targetType: SelfAction | AreaAction | EntityAction
};

export type ActionComponent = {
    actions: Action[];
}
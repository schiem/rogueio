export enum ConsumableCategory {
    potion = 1,
    scroll
}

export enum ConsumableType {
    lesserHealing = 1,
    greaterHealing,
}

export type ConsumableComponent = {
    // Should this be hidden? Probably fine if not
    uses: number;
    category: ConsumableCategory;
    // This is randomized every run - the player will have to discover what each effect is
    effect: ConsumableType;
}
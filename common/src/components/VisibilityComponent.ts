export type VisiblityComponent = {
    sharedComponentId: number;
    //awareOf: Record<number, boolean>;
    visible: Record<number, Record<number, boolean>>,
    sightRadius: number
}

export type SharedVisibilityComponent = {
    seen: boolean[][];
    entitiesInGroup: number[];
}
export type VisibilityComponent = {
    visible: Record<number, Record<number, boolean>>,
    sightRadius: number
}

export type SharedVisibilityComponent = {
    seen: boolean[][];
}
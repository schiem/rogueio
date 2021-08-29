export type VisiblityComponent = {
    visible: Record<number, Record<number, boolean>>,
    sightRadius: number
}

export type SharedVisibilityComponent = {
    seen: boolean[][];
}
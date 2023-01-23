import { Point } from "../types/Points";
import { Tile } from "../types/Tile";

export type TileLocation = { loc: Point, tile: Tile };
export type VisibilityComponent = {
    visible: Record<number, Record<number, boolean>>,
    sightRadius: number
}

export type SharedVisibilityComponent = {
    seen: boolean[][];
}
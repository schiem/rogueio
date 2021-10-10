import { Point } from "../types/Points";
export enum RoomFeatureNames {
    water
}

export type RoomFeatures = {
    [RoomFeatureNames.water]?: {
        originTile: Point
    }
}
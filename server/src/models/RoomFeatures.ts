import { Point } from "../../../common/src/types/Points";
export enum RoomFeatureNames {
    water
}

export type RoomFeatures = {
    [RoomFeatureNames.water]?: {
        originTile: Point
    }
}
import { Dungeon } from "../../../common/src/models/Dungeon";
import { WaterSpawner } from "../generators/RoomFeatureSpawners/WaterSpawner";
import { Room } from "./Room";

export enum RoomFeature {
    water
}

export const RoomFeatureSpawners: Record<RoomFeature, (room: Room, dungeon: Dungeon) => boolean> = {
    [RoomFeature.water]: WaterSpawner 
}
import { RoomType } from "../../models/RoomType"
import { Spawner } from "../Spawner"
import { BufonidSpawner } from "./BufonidSpawner"

export enum MonsterSpawnerType {
    bufonid = 1,
};

export const MonsterSpawners: Record<MonsterSpawnerType, Spawner> = {
    [MonsterSpawnerType.bufonid]: BufonidSpawner,
}

export const MonsterRoomSpawners: Record<RoomType, MonsterSpawnerType[]> = {
    [RoomType.active]: [],
    [RoomType.abandoned]: [],
    [RoomType.natural]: [MonsterSpawnerType.bufonid],
}
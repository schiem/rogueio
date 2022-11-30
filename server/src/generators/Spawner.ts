import { EntityManager } from "../../../common/src/entities/EntityManager";
import { GameSystems } from "../../../common/src/models/Game";
import { Condition, Room } from "../models/Room";
import { RoomFeatureNames } from "../models/RoomFeatures";
import { ServerDungeon } from "../models/ServerDungeon";
import { BufonidSpawner } from "./BufonidSpawner";
import { RandomItemSpawner } from "./RandomItemSpawner";

export type Spawner = {
    ageRange: {
        min: Condition,
        max: Condition 
    };
    spawnInFeatures: RoomFeatureNames[];
    doSpawn: (dungeon: ServerDungeon, room: Room, entityManager: EntityManager, systems: GameSystems) => void;
};

export enum SpawnerType {
    bufonid = 1,
    randomItem
};

export const Spawners: Record<SpawnerType, Spawner> = {
    [SpawnerType.bufonid]: BufonidSpawner,
    [SpawnerType.randomItem]: RandomItemSpawner 
}
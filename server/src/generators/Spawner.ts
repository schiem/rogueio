import { EntityManager } from "../../../common/src/entities/EntityManager";
import { GameSystems } from "../../../common/src/models/Game";
import { Room } from "../models/Room";
import { RoomFeature } from "../models/RoomFeatures";
import { ServerDungeon } from "../models/ServerDungeon";

export type Spawner = {
    requires: RoomFeature[];
    doSpawn: (room: Room, dungeon: ServerDungeon, entityManager: EntityManager, systems: GameSystems) => void;
};
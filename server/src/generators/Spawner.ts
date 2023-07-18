import { EntityManager } from "../../../common/src/entities/EntityManager";
import { Room } from "../models/Room";
import { RoomFeature } from "../models/RoomFeatures";
import { ServerDungeon } from "../models/ServerDungeon";
import { ServerGameSystems } from "../models/ServerGame";

export type Spawner = {
    requires: RoomFeature[];
    doSpawn: (room: Room, dungeon: ServerDungeon, entityManager: EntityManager, systems: ServerGameSystems) => void;
};
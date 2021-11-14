import { Dungeon } from "../../../common/src/models/Dungeon";
import { Room } from "./Room";

export class ServerDungeon extends Dungeon {
    rooms: Room[] = [];
}
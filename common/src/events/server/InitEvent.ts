import { ServerEvent, ServerEventType } from "./ServerEvent";
import { Dungeon } from "../../models/Dungeon";
import { Player } from "../../models/Player";
import { ServerGame } from "../../../../server/src/models/ServerGame";

type InitData = {
    dungeon: Dungeon;
    players: Record<string, Player>;
    playerId: string;
};

export class InitEvent extends ServerEvent {
    type = ServerEventType.init;
    data: InitData;

    constructor(game: ServerGame, playerId: string) {
        super();
        this.data = {
            players: game.players,
            playerId: playerId,
            dungeon: game.currentDungeon
        };
    }
}
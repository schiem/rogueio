import { ServerEvent, ServerEventType } from "./ServerEvent";
import { ServerGame } from "../../../../server/src/models/ServerGame";
import { Game } from "../../models/Game";

type InitData = {
    game: Game,
    playerId: string;
};

export class InitEvent extends ServerEvent {
    type = ServerEventType.init;
    data: InitData;

    constructor(game: ServerGame, playerId: string) {
        super();
        this.data = {
            game,
            playerId: playerId,
        };
    }
}
import { ServerEvent, ServerEventType } from "../../../common/src/events/server/ServerEvent";
import { ClientGame } from "../models/ClientGame";
import { InitEvent } from "../../../common/src/events/server/InitEvent";

export class EventHandler {
    static handleEvent(game: ClientGame, serverEvent: ServerEvent): void {
        if (this.eventHandlers[serverEvent.type] !== undefined) {
            this.eventHandlers[serverEvent.type](game, serverEvent as any);
        }
    }

    private static eventHandlers = {
        [ServerEventType.init]: (game: ClientGame, event: InitEvent): void => {
            game.initDungeon(event.data.dungeon);
            game.players = event.data.players;
            game.currentPlayerId = event.data.playerId;
        },
        [ServerEventType.message]: (game: ClientGame, event: any): void => {
        },
        [ServerEventType.update]: (game: ClientGame, event: any): void => {
        },
    }
}
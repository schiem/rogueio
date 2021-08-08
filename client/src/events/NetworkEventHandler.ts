import { ServerEvent, ServerEventType } from "../../../common/src/events/server/ServerEvent";
import { ClientGame } from "../models/ClientGame";
import { InitEvent } from "../../../common/src/events/server/InitEvent";
import { UpdateEntityEvent } from "../../../common/src/events/server/UpdateEvent";

export class NetworkEventHandler {
    static handleEvent(game: ClientGame, serverEvent: ServerEvent): void {
        if (this.eventHandlers[serverEvent.type] !== undefined) {
            this.eventHandlers[serverEvent.type](game, serverEvent as any);
        }
    }

    // the functions for handling any events received from the server
    private static eventHandlers = {
        [ServerEventType.init]: (game: ClientGame, event: InitEvent): void => {
            game.postDeserialize(event);
            game.renderDungeon(game.currentLevel);
        },
        [ServerEventType.message]: (game: ClientGame, event: any): void => {
        },
        [ServerEventType.update]: (game: ClientGame, event: UpdateEntityEvent): void => {
            const system = (game.systems as any)[event.data.system];
            if (!system) {
                throw new Error('Invalid system');
            }
            //game.updateEntity(event.data.id, event.data.property, event.data.value);
        },
    }
}
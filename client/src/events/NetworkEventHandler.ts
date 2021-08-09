import { ServerEvent, ServerEventType } from "../../../common/src/events/server/ServerEvent";
import { ClientGame } from "../models/ClientGame";
import { InitEvent } from "../../../common/src/events/server/InitEvent";
import { UpdateEntityEvent } from "../../../common/src/events/server/UpdateEvent";
import { ComponentSystem } from "../../../common/src/systems/ComponentSystem";
import { NetworkEvent } from "../../../common/src/events/NetworkEvent";

/**
 * The client network event handler is completely unrelated to the server event handler.
 * On the client, events are immediately sent as they happen, often directly from InputEvents.
 * The server queues events to flush.
 * 
 * Incoming events are handled similarly.
 * 
 * This class is static because there is only one game, unlike the server which may be running multiple.
 */
export class NetworkEventHandler {
    private static connection: WebSocket;

    static setConnecton(ws: WebSocket): void {
        this.connection = ws;
    }

    static sendEvent(event: NetworkEvent): void {
        this.connection.send(JSON.stringify(event));
    }

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
            const system: ComponentSystem = (game.systems as any)[event.data.system];
            if (!system) {
                throw new Error('Invalid system');
            }
            system.updateComponent(event.data.id, event.data.properties);
        }
    }
}
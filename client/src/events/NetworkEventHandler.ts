import { ServerEvent, ServerEventType } from "../../../common/src/events/server/ServerEvent";
import { ClientGame } from "../models/ClientGame";
import { InitEvent } from "../../../common/src/events/server/InitEvent";
import { ComponentSystem } from "../../../common/src/systems/ComponentSystem";
import { NetworkEvent } from "../../../common/src/events/NetworkEvent";
import { UpdateEntityEvent } from "../../../common/src/events/server/UpdateEntityEvent";
import { AddEntityComponentsEvent } from "../../../common/src/events/server/AddEntityComponentEvent";
import { AddEntityEvent } from "../../../common/src/events/server/AddEntityEvent";
import { RemoveEntityEvent } from "../../../common/src/events/server/RemoveEntityEvent";
import { encode } from "messagepack";
import { RemoveVisibleComponentsEvent } from "../../../common/src/events/server/RemoveVisibleComponentsEvent";

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
        this.connection.send(encode(event));
    }

    static handleEvent(game: ClientGame, serverEvent: ServerEvent): void {
        const handler = (this.eventHandlers as any)[serverEvent.type];
        console.log(serverEvent);
        if (handler !== undefined) {
            handler(game, serverEvent as any);
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
            const system: ComponentSystem<any> = (game.systems as any)[event.data.system];
            if (!system) {
                throw new Error('Invalid system');
            }
            system.updateComponent(event.data.id, event.data.properties);
        },
        [ServerEventType.addComponent]: (game: ClientGame, event: AddEntityComponentsEvent): void => {
            for(let systemName in event.data.components) {
                const system: ComponentSystem<any> = (game.systems as any)[systemName];
                if (!system) {
                    throw new Error('Invalid system');
                }
                system.addComponentForEntity(event.data.id, event.data.components[systemName]);
            }
        },
        [ServerEventType.addEntity]: (game: ClientGame, event: AddEntityEvent): void => {
            game.entityManager.addEntity(event.data.id);
        },
        [ServerEventType.removeEntity]: (game: ClientGame, event: RemoveEntityEvent): void => {
            game.entityManager.removeEntity(event.data.id);
        },
        [ServerEventType.removeVisibleComponents]: (game: ClientGame, event: RemoveVisibleComponentsEvent): void => {
            const systems = game.systems as Record<string, ComponentSystem<unknown>>;
            for(let systemName in game.systems) {
                const system = systems[systemName];
                if (system.replicationMode === 'visible') {
                    system.removeComponentFromEntity(event.data.id);
                }
            }
        }
    }
}
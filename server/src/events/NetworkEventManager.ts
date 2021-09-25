import { NetworkEvent } from "../../../common/src/events/NetworkEvent";
import * as WebSocket from 'ws';
import { ClientEvent, ClientEventType } from "../../../common/src/events/client/ClientEvent";
import { Game, GameSystems } from "../../../common/src/models/Game";
import { MoveEvent } from "../../../common/src/events/client/MoveEvent";
import { UpdateEntityEvent } from "../../../common/src/events/server/UpdateEntityEvent";
import { ComponentSystem } from "../../../common/src/systems/ComponentSystem";
import { AddEntityComponentEvent } from "../../../common/src/events/server/AddEntityComponentEvent";
import { RemoveEntityComponentEvent } from "../../../common/src/events/server/RemoveEntityComponentEvent";
import { EntityManager } from "../../../common/src/entities/EntityManager";
import { AddEntityEvent } from "../../../common/src/events/server/AddEntityEvent";
import { RemoveEntityEvent } from "../../../common/src/events/server/RemoveEntityEvent";
import { ServerEvent } from "../../../common/src/events/server/ServerEvent";

/**
 * Handles both incoming and outgoing events.
 */
export class NetworkEventManager {
    eventQueue: Record<string, NetworkEvent[]> = {};
    private eventHandlers = {
        [ClientEventType.move]: (playerId: string, game: Game, event: MoveEvent) => {
            const characterId = game.players[playerId].characterId;
            this.systems.movement.attemptMove(characterId, event.data.direction, game.currentLevel);
        }
    }
    constructor(
        private systems: GameSystems,
        entityManager: EntityManager
    ) {
        entityManager.entityAddedEmitter.subscribe((entity) => {
            this.queueEvent(new AddEntityEvent(entity), {} as ComponentSystem<any>);
        });

        // TODO - removing an entity removes all it's components - shouldn't fire events for those
        entityManager.entityRemovedEmitter.subscribe((entity) => {
            this.queueEvent(new RemoveEntityEvent(entity), {} as ComponentSystem<any>)
        });


        Object.keys(systems).forEach((systemName) => {
            const system: ComponentSystem<any> = (systems as any)[systemName];

            // Don't replicate this ever
            if (system.replicationMode === 'none') {
                return;
            }

            // any time a component is added / removed, reflect it across the network
            system.addedComponentEmitter.subscribe((data) => {
                this.queueEvent(new AddEntityComponentEvent(data.id, systemName, data.component), system);
            });

            system.removedComponentEmitter.subscribe((data) => {
                this.queueEvent(new RemoveEntityComponentEvent(data.id, systemName), system);
            });

            system.componentUpdatedEmitter.subscribe((data) => {
                this.queueEvent(new UpdateEntityEvent(data.id, systemName, data.props), system);
            });
        });
    }

    addPlayerEventQueue(playerId: string): void {
        this.eventQueue[playerId] = [];
    }

    removePlayerEventQueue(playerId: string): void {
        delete this.eventQueue[playerId];
    }

    queueEvent(event: NetworkEvent, fromSystem: ComponentSystem<any>): void {
        for(let playerId in this.eventQueue) {
            const queue = this.eventQueue[playerId];
            queue.push(event);
        }
    }

    /**
     * Responsible for handling any incoming events.
     * These will be passed to the systems, which may
     * cause side effects to the game state which will need
     * to be reflected across the network.
     */
    handleEvent(playerId: string, game: Game, event: ClientEvent): void {
        if (this.eventHandlers[event.type] !== undefined) {
            this.eventHandlers[event.type](playerId, game, event);
        }
    }

    flushEvents(clients: Record<string, WebSocket>): void {
        for(let playerId in clients) {
            if (this.eventQueue[playerId] && this.eventQueue[playerId].length) {
                clients[playerId].send(this.serializeEvents(this.eventQueue[playerId]));
                this.eventQueue[playerId] = [];
            }
        }
    }

    serializeEvents(events: ServerEvent[]): string | ArrayBuffer {
        return '[' + events.map((event) => event.serialize()).join(',') + ']';
    }
}
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

/**
 * Handles both incoming and outgoing events.
 */
export class NetworkEventManager {
    eventQueue: NetworkEvent[] = [];
    private eventHandlers = {
        [ClientEventType.move]: (playerId: string, game: Game, event: MoveEvent) => {
            const characterId = game.players[playerId].characterId;
            this.systems.movement.attemptMove(characterId, event.data.direction, game.currentLevel);
        }
    }
    constructor(
        public systems: GameSystems,
        public entityManager: EntityManager
    ) {
        entityManager.entityAddedEmitter.subscribe((entity) => {
            this.eventQueue.push(new AddEntityEvent(entity));
        });

        // TODO - removing an entity removes all it's components - shouldn't fire events for those
        entityManager.entityRemovedEmitter.subscribe((entity) => {
            this.eventQueue.push(new RemoveEntityEvent(entity));
        });


        Object.keys(systems).forEach((systemName) => {
            const system: ComponentSystem = (systems as any)[systemName];

            // Don't replicate this ever
            if (system.replicationMode === 'none') {
                return;
            }

            // any time a component is added / removed, reflect it across the network
            system.addedComponentEmitter.subscribe((data) => {
                this.eventQueue.push(new AddEntityComponentEvent(data.id, systemName, data.component));
            });

            system.removedComponentEmitter.subscribe((data) => {
                this.eventQueue.push(new RemoveEntityComponentEvent(data.id, systemName));
            });

            system.componentUpdatedEmitter.subscribe((data) => {
                this.eventQueue.push(new UpdateEntityEvent(data.id, systemName, data.props));
            });
        });
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

    flushEvents(clients: WebSocket[]): void {
        if (this.eventQueue.length) {
            clients.forEach((ws) => {
                ws.send(JSON.stringify(this.eventQueue));
            });
            this.eventQueue = [];
        }
    }
}
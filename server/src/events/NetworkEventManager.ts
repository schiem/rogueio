import * as WebSocket from 'ws';
import { ClientEvent, ClientEventType } from "../../../common/src/events/client/ClientEvent";
import { MoveEvent } from "../../../common/src/events/client/MoveEvent";
import { UpdateEntityEvent } from "../../../common/src/events/server/UpdateEntityEvent";
import { ComponentSystem } from "../../../common/src/systems/ComponentSystem";
import { AddEntityComponentsEvent } from "../../../common/src/events/server/AddEntityComponentEvent";
import { RemoveEntityComponentEvent } from "../../../common/src/events/server/RemoveEntityComponentEvent";
import { EntityManager } from "../../../common/src/entities/EntityManager";
import { AddEntityEvent } from "../../../common/src/events/server/AddEntityEvent";
import { RemoveEntityEvent } from "../../../common/src/events/server/RemoveEntityEvent";
import { ServerEvent } from "../../../common/src/events/server/ServerEvent";
import { encode } from "messagepack";
import { Player } from "../../../common/src/models/Player";
import { ServerGame, ServerGameSystems } from "../models/ServerGame";
import { RemoveVisibleComponentsEvent } from "../../../common/src/events/server/RemoveVisibleComponentsEvent";
import { ActionEvent } from "../../../common/src/events/client/ActionEvent";
import { NetworkEvent } from '../../../common/src/events/NetworkEvent';

/**
 * Handles both incoming and outgoing events.
 */
export class NetworkEventManager {
    eventQueue: Record<string, NetworkEvent[]> = {};
    private eventHandlers: Record<ClientEventType, (playerId: string, game: ServerGame, event: ClientEvent) => void> = {
        [ClientEventType.move]: (playerId: string, game: ServerGame, event: MoveEvent) => {
            const characterId = game.players[playerId].characterId;
            this.systems.movement.attemptMove(characterId, event.data.direction, game.currentLevel);
        },
        [ClientEventType.action]: (playerId: string, game: ServerGame, event: ActionEvent) => {
            const characterId = game.players[playerId].characterId;
            // Do action handles all validation, so they can attmept to do an invalid action as much
            // as they would like
            game.systems.action.doAction(characterId, event.data.id, event.data.target);
        }
    }
    constructor(
        private players: Record<string, Player>,
        private systems: ServerGameSystems,
        private entityManager: EntityManager
    ) {
        entityManager.entityAddedEmitter.subscribe((entity) => {
            this.queueEvent(new AddEntityEvent(entity));
        });

        // TODO - removing an entity removes all it's components - shouldn't fire events for those
        entityManager.entityRemovedEmitter.subscribe((entity) => {
            this.queueEvent(new RemoveEntityEvent(entity));
        });

        // When the visibility of a component changes, send the visibility pieces to the relevant entities
        systems.visibility.entityChangedVisibilityEmitter.subscribe((data) => {
            const charLookup: Record<number, string> = {}
            for(let playerId in players) {
                charLookup[players[playerId].characterId] = playerId;
            }
            
            let event: NetworkEvent;
            if (data.visible) {
                // Add all the visible components for the entity
                const components: Record<string, any> = {};
                for(let systemName in systems) {
                    const system = (systems as Record<string, ComponentSystem<unknown>>)[systemName];
                    if (system.replicationMode === 'visible') {
                        const component = system.getComponent(data.entityId);
                        if (component) {
                            components[systemName] = component;
                        }
                    }
                }
                event = new AddEntityComponentsEvent(data.entityId, components);
            } else {
                // Remove all visible components - the client already has these, no need to specify
                event = new RemoveVisibleComponentsEvent(data.entityId);
            }

            data.forEntities.forEach((entityId) => {
                if (charLookup[entityId]) {
                    this.queueEventForPlayer(charLookup[entityId], event);
                }
            });
        });

        Object.keys(systems).forEach((systemName) => {
            const system: ComponentSystem<unknown> = (systems as any)[systemName];

            // Don't replicate this ever
            if (system.replicationMode === 'none') {
                return;
            }

            // any time a component is added / removed, reflect it across the network
            system.addedComponentEmitter.subscribe((data) => {
                this.queueEvent(new AddEntityComponentsEvent(data.id, {[systemName]: data.component}), system);
            });

            system.removedComponentEmitter.subscribe((data) => {
                this.queueEvent(new RemoveEntityComponentEvent(data.id, systemName), system);
            });

            system.componentUpdatedEmitter.subscribe((data) => {
                this.queueEvent(new UpdateEntityEvent(data.id, systemName, data.props, data.triggeredBy), system);
            });
        });
    }

    addPlayerEventQueue(playerId: string): void {
        this.eventQueue[playerId] = [];
    }

    removePlayerEventQueue(playerId: string): void {
        delete this.eventQueue[playerId];
    }

    queueEvent(event: NetworkEvent, fromSystem?: ComponentSystem<unknown>): void {
        for(let playerId in this.eventQueue) {
            const entityId = this.players[playerId].characterId;
            const appliesTo: number | undefined = event.data?.id;
            // Ensure that:
            //   * The entity is aware of the entity that this event corresponds to OR
            //   * There is no entity that this event corresponds to OR
            //   * This is a global event (no system)
            if (!fromSystem || appliesTo === undefined || this.entityManager.entityIsAwareOfComponent(entityId, appliesTo, this.systems, fromSystem.replicationMode)) {
                if (event instanceof UpdateEntityEvent && event.data.triggeredBy !== entityId && event.data.id !== entityId) {
                    // Remove the triggered by property if the current player was not the cause / effect of this update
                    // No need to waste the bandwidth
                    delete event.data.triggeredBy;
                }
                this.queueEventForPlayer(playerId, event);
            }
        }
    }

    queueEventForPlayer(playerId: string, event: NetworkEvent): void {
        const queue = this.eventQueue[playerId];
        queue.push(event);
    }

    /**
     * Responsible for handling any incoming events.
     * These will be passed to the systems, which may
     * cause side effects to the game state which will need
     * to be reflected across the network.
     */
    handleEvent(playerId: string, game: ServerGame, event: ClientEvent): void {
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
        return encode(events);
    }
}
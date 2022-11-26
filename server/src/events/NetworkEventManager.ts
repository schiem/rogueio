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
    eventSendQueue: Record<string, NetworkEvent[]> = {};
    private playerEventQueue: Record<string, ClientEvent> = {};

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

        entityManager.entityRemovedEmitter.subscribe((entity) => {
            this.queueEvent(new RemoveEntityEvent(entity));
        });

        // TODO - move this into the health system
        systems.health.componentUpdatedEmitter.subscribe((data) => {
            if (data.props.current !== undefined) {
                // Oh dear, the entity has died
                if ((data.props.current as number) <= 0) {
                    // Allow all other events to fire before removing the entity
                    // Otherwise no update events will fire
                    queueMicrotask(() => {
                        entityManager.removeEntity(data.id);
                    });
                }
            } 
        });

        // Location is a special case - it's only sent on visible, but when it's removed
        // the entity is no longer considered visible, so the event to remove it doesn't send
        systems.location.removedComponentEmitter.subscribe((data) => {
            for (let playerId in this.eventSendQueue) {
                const entityId = this.players[playerId].characterId;

                if (systems.visibility.tileIsVisible(entityId, data.component.location)) {
                    this.queueEventForPlayer(playerId, new RemoveEntityComponentEvent(data.id, 'location'));
                }
            }
        });

        // When the visibility of a component changes, send the visibility pieces to the relevant entities
        systems.visibility.entityChangedVisibilityEmitter.subscribe((data) => {
            const charLookup: Record<number, string> = {};
            for(let playerId in players) {
                charLookup[players[playerId].characterId] = playerId;
            }
            
            let event: NetworkEvent;
            if (data.visible) {
                // Add all the visible components for the entity
                const components: Record<string, unknown> = {};
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
                    // Bypass the visibility check - the event is being queued directly for a player
                    this.queueEventForPlayer(charLookup[entityId], event);
                }
            });
        });

        Object.keys(systems).forEach((systemName) => {
            const system: ComponentSystem<unknown> = (systems as Record<string, ComponentSystem<unknown>>)[systemName];

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
        this.eventSendQueue[playerId] = [];
    }

    removePlayerEventQueue(playerId: string): void {
        delete this.eventSendQueue[playerId];
    }

    queueEvent(event: NetworkEvent, fromSystem?: ComponentSystem<unknown>): void {
        for(let playerId in this.eventSendQueue) {
            const entityId = this.players[playerId].characterId;
            const appliesTo: number | undefined = event.data?.id;
            // Ensure that:
            //   * The entity is aware of the entity that this event corresponds to OR
            //   * There is no entity that this event corresponds to OR
            //   * This is a global event (no system)
            if (!fromSystem || appliesTo === undefined || this.entityManager.entityIsAwareOfComponent(entityId, appliesTo, this.systems, fromSystem.replicationMode)) {
                this.queueEventForPlayer(playerId, event);
            }
        }
    }

    queueEventForPlayer(playerId: string, event: NetworkEvent): void {
        const queue = this.eventSendQueue[playerId];
        queue.push(event);
    }

    /**
     * Responsible for handling any incoming events.
     * Each player may only take 1 action / tick.  I may change this later
     * so certain actions will be processed immediately.
     */
    handleEvent(playerId: string, event: ClientEvent): void {
        if (this.eventHandlers[event.type] !== undefined) {
            this.playerEventQueue[playerId] = event;
        }
    }

    /**
     * Flushes received events
     */
    doReceivedEvents(game: ServerGame): void {
        for (const playerId in this.playerEventQueue) {
            const event = this.playerEventQueue[playerId];
            this.eventHandlers[event.type](playerId, game, event);
        }

        this.playerEventQueue = {};
    }

    flushSendEvents(clients: Record<string, WebSocket>): void {
        for(let playerId in clients) {
            if (this.eventSendQueue[playerId] && this.eventSendQueue[playerId].length) {
                clients[playerId].send(this.serializeEvents(this.eventSendQueue[playerId]));
                this.eventSendQueue[playerId] = [];
            }
        }
    }

    serializeEvents(events: ServerEvent[]): string | ArrayBuffer {
        return encode(events);
    }
}
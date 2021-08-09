import { NetworkEvent } from "../../../common/src/events/NetworkEvent";
import * as WebSocket from 'ws';
import { ClientEvent, ClientEventType } from "../../../common/src/events/client/ClientEvent";
import { Game, GameSystems } from "../../../common/src/models/Game";
import { MoveEvent } from "../../../common/src/events/client/MoveEvent";
import { UpdateEntityEvent } from "../../../common/src/events/server/UpdateEvent";

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
        public systems: GameSystems
    ) {
        this.bindLocationSystem();
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

    private bindLocationSystem(): void {
        this.systems.location.locationMovedEmitter.subscribe((data) => {
            const event = new UpdateEntityEvent(data.id, 'location', {'location': data.newLocation});
            this.eventQueue.push(event);
        });
    }
}
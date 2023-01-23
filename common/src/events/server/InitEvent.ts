import { ServerEvent, ServerEventType } from "./ServerEvent";
import { Player } from "../../models/Player";
import { ComponentSystem } from "../../systems/ComponentSystem";
import { Game } from "../../models/Game";
import { EntityManager } from "../../entities/EntityManager";
import { TileLocation } from "../../components/VisibilityComponent";

type InitData = {
    gameData: { 
        dungeonX: number, 
        dungeonY: number, 
        tiles?: TileLocation[], 
        players: Record<string, Player>, 
        entities: Record<number, Record<string, unknown>>
        additionalSystemData: Record<string, unknown>;
    },
    playerId: string;
};

export class InitEvent extends ServerEvent {
    type = ServerEventType.init;
    data: InitData;

    constructor(game: Game, entityManager: EntityManager, playerId: string) {
        super();
        const characterId = game.players[playerId].characterId;
        const entities: Record<number, Record<string, unknown>> = {};
        game.entityManager.forEachEntity((id) => {
            const systems: Record<string, unknown> = {};
            for(const systemName in game.systems) {
                const system = (game.systems as Record<string, ComponentSystem<unknown>>)[systemName];
                const component = system.getComponent(id);
                if (component && entityManager.entityIsAwareOfComponent(characterId, id, game.systems, system.replicationMode)) {
                    systems[systemName] = component;
                }
            }

            entities[id] = systems;
        });

        const additionalSystemData: Record<string, unknown> = {};
        for(const systemName in game.systems) {
            const system = (game.systems as Record<string, ComponentSystem<unknown>>)[systemName];
            const additionalData = system.additionalDataForEntity(characterId);
            if (additionalData) {
                additionalSystemData[systemName] = additionalData;
            }
        }

        this.data = {
            gameData: {
                dungeonX: game.dungeonX,
                dungeonY: game.dungeonY,
                // TODO - these constructors should really be on the server, there's no reason for them to be in the client
                // Leave the data though
                tiles: (game.systems.visibility as any).getSeenTilesForEntity(characterId),
                players: game.players,
                entities: entities,
                additionalSystemData
            },
            playerId,
        };
    }
}
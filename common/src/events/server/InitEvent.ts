import { ServerEvent, ServerEventType } from "./ServerEvent";
import { Tile } from "../../types/Tile";
import { Player } from "../../models/Player";
import { ComponentSystem } from "../../systems/ComponentSystem";
import { Game } from "../../models/Game";
import { EntityManager } from "../../entities/EntityManager";
import { ServerVisbilitySystem } from "../../../../server/src/systems/ServerVisbilitySystem";

type InitData = {
    gameData: { 
        dungeonX: number, 
        dungeonY: number, 
        tiles?: Tile[], 
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
                if (entityManager.entityIsAwareOfComponent(characterId, id, game.systems, system.replicationMode)) {
                    systems[systemName] = system.getComponent(id);
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
                tiles: (game.systems.visibility as ServerVisbilitySystem).getSeenTilesForEntity(characterId),
                players: game.players,
                entities: entities,
                additionalSystemData
            },
            playerId,
        };
    }
}
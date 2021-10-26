import { ServerEvent, ServerEventType } from "./ServerEvent";
import { Game } from "../../models/Game";
import { Tile } from "../../types/Tile";
import { Player } from "../../models/Player";
import { ComponentSystem } from "../../systems/ComponentSystem";

type InitData = {
    gameData: { 
        dungeonX: number, 
        dungeonY: number, 
        tiles?: Tile[], 
        players: Record<string, Player>, 
        entities: Record<number, Record<string, any>>
        additionalSystemData: Record<string, any>;
    },
    playerId: string;
};

export class InitEvent extends ServerEvent {
    type = ServerEventType.init;
    data: InitData;

    constructor(game: Game, playerId: string) {
        super();
        const characterId = game.players[playerId].characterId;
        const entities: Record<number, Record<string, any>> = {};
        game.entityManager.forEachEntity((id) => {
            const systems: Record<string, any> = {};
            for(const systemName in game.systems) {
                const system = (game.systems as Record<string, ComponentSystem<unknown>>)[systemName];
                if (system.entityIsAwareOfComponent(characterId, id, game.systems)) {
                    systems[systemName] = system.getComponent(id);
                }
            }

            entities[id] = systems;
        });

        const additionalSystemData: Record<string, any> = {};
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
                tiles: (game.systems.visibility as any).getSeenTilesForEntity(characterId),
                players: game.players,
                entities: entities,
                additionalSystemData
            },
            playerId,
        };
    }
}
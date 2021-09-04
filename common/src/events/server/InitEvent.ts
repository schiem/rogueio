import { ServerEvent, ServerEventType } from "./ServerEvent";
import { ServerGame } from "../../../../server/src/models/ServerGame";
import { GameSystems } from "../../models/Game";
import { ServerVisbilitySystem } from "../../../../server/src/systems/ServerVisbilitySystem";
import { Tile } from "../../types/Tile";
import { Player } from "../../models/Player";
import { EntityManager } from "../../entities/EntityManager";

type InitData = {
    gameData: { 
        dungeonX: number, 
        dungeonY: number, 
        tiles?: Tile[], 
        systems: GameSystems, 
        players: Record<string, Player>, 
        entityManager: EntityManager 
    },
    playerId: string;
};

export class InitEvent extends ServerEvent {
    type = ServerEventType.init;
    data: InitData;

    constructor(game: ServerGame, playerId: string) {
        super();
        const characterId = game.players[playerId].characterId;
        this.data = {
            gameData: {
                dungeonX: game.dungeonX,
                dungeonY: game.dungeonY,
                tiles: (game.systems.visibility as ServerVisbilitySystem).getSeenTilesForEntity(characterId),
                systems: game.systems,
                players: game.players,
                entityManager: game.entityManager
            },
            playerId,
        };
    }
}
import { ServerEvent, ServerEventType } from "./ServerEvent";
import { Game, GameSystems } from "../../models/Game";
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

    constructor(game: Game, playerId: string) {
        super();
        const characterId = game.players[playerId].characterId;
        this.data = {
            gameData: {
                dungeonX: game.dungeonX,
                dungeonY: game.dungeonY,
                tiles: (game.systems.visibility as any).getSeenTilesForEntity(characterId),
                systems: game.systems,
                players: game.players,
                entityManager: game.entityManager
            },
            playerId,
        };
    }
}
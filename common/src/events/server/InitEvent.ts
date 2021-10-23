import { ServerEvent, ServerEventType } from "./ServerEvent";
import { Game } from "../../models/Game";
import { Tile } from "../../types/Tile";
import { Player } from "../../models/Player";

type InitData = {
    gameData: { 
        dungeonX: number, 
        dungeonY: number, 
        tiles?: Tile[], 
        systems: Record<string, any>, 
        players: Record<string, Player>, 
        entityManager: any 
    },
    playerId: string;
};

export class InitEvent extends ServerEvent {
    type = ServerEventType.init;
    data: InitData;

    constructor(game: Game, playerId: string) {
        super();
        const characterId = game.players[playerId].characterId;
        const systems: Record<string, any> = {};
        for(const system in game.systems) {
            systems[system] = (game.systems as any)[system].asSerializable();
        }

        this.data = {
            gameData: {
                dungeonX: game.dungeonX,
                dungeonY: game.dungeonY,
                tiles: (game.systems.visibility as any).getSeenTilesForEntity(characterId),
                systems: systems,
                players: game.players,
                entityManager: game.entityManager.asSerializable()
            },
            playerId,
        };
    }
}
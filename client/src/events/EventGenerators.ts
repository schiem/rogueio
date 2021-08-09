import { LocationComponent } from "../../../common/src/components/LocationComponent";
import { MoveEvent } from "../../../common/src/events/client/MoveEvent";
import { Point } from "../../../common/src/types/Points";
import { ClientGame } from "../models/ClientGame"

export const generateMoveEvent = (game: ClientGame, direction: Point): MoveEvent | undefined => {
    const entityId = game.players[game.currentPlayerId].characterId;
    const component: LocationComponent = game.systems.location.getComponent(entityId);
    const newLocation = {x: component.location.x + direction.x, y: component.location.y + direction.y};
    if(!game.systems.location.canMoveTo(component, newLocation, game.currentLevel)) {
        return;
    }
    return new MoveEvent(direction);
}
import { LocationComponent } from "../../../common/src/components/LocationComponent";
import { ActionEvent } from "../../../common/src/events/client/ActionEvent";
import { MoveEvent } from "../../../common/src/events/client/MoveEvent";
import { Point } from "../../../common/src/types/Points";
import { ClientGame } from "../models/ClientGame"

export const generateEventFromMovement = (game: ClientGame, direction: Point): MoveEvent | ActionEvent | undefined => {
    const entityId = game.players[game.currentPlayerId].characterId;
    const component = game.systems.location.getComponent(entityId);
    if (!component) {
        return;
    }
    const newLocation = {x: component.location.x + direction.x, y: component.location.y + direction.y};

    const entitiesAtLocation = game.systems.location.getEntitiesAtLocation(newLocation);
    const enemyAtLocation = entitiesAtLocation.find((id) => {
        // Ensure that it has a health component, and that it is not an ally
        return game.systems.health.getComponent(id) && !game.systems.ally.entitiesAreAllies(entityId, id)
    });
    if (enemyAtLocation) {
        // The first event is always the "default attack"
        return new ActionEvent(0, enemyAtLocation);
    }

    if(!game.systems.location.canMoveTo(component, newLocation, game.currentLevel)) {
        return;
    }

    return new MoveEvent(direction);
}
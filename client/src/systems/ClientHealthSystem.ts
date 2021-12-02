import { HealthComponent } from "../../../common/src/components/HealthComponent";
import { EntityManager } from "../../../common/src/entities/EntityManager";
import { HealthSystem } from "../../../common/src/systems/HealthSystem";
import { ClientGame } from "../models/ClientGame";
import { ClientDescriptionSystem } from "./ClientDescriptionSystem";

export class ClientHealthSystem extends HealthSystem {
    constructor(entityManager: EntityManager, clientDescriptionSystem: ClientDescriptionSystem, game: ClientGame) {
        super(entityManager);

        this.componentUpdatedEmitter.subscribe((data) => {
            if (data.props.current !== undefined) {
                const characterId = game.players[game.currentPlayerId].characterId;
                if (data.triggeredBy === characterId) {
                    clientDescriptionSystem.getLocalizedName(data.id).then((name) => {
                        game.messageEmitter.emit({message: 'common/action/playerDidDamage', replacements: [name]})
                    })
                } else if(data.id === characterId) {
                    game.messageEmitter.emit({message: 'common/action/playerTookDamage'})
                }
            }
        });
    }
}
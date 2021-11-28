import { HealthComponent } from "../../../common/src/components/HealthComponent";
import { EntityManager } from "../../../common/src/entities/EntityManager";
import { HealthSystem } from "../../../common/src/systems/HealthSystem";
import { ClientGame } from "../models/ClientGame";

export class ClientHealthSystem extends HealthSystem {
    constructor(entityManager: EntityManager, game: ClientGame) {
        super(entityManager);

        this.componentUpdatedEmitter.subscribe((data) => {
            console.log('message emitter');
            console.log(data);
            if (data.props.current !== undefined) {
                const characterId = game.players[game.currentPlayerId].characterId;
                if (data.triggeredBy === characterId) {
                    game.messageEmitter.emit({message: 'common/action/playerDidDamage'})
                } else if(data.id === characterId) {
                    game.messageEmitter.emit({message: 'common/action/playerTookDamage'})
                }
            }
        });
    }
}
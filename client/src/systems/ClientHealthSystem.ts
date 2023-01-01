import { Bus } from "../../../common/src/bus/Buses";
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
                        Bus.messageEmitter.emit({ message: 'common/action/playerDidDamage', replacements: [name], entities: [] })

                        if (data.props.current as number <= 0) {
                            Bus.messageEmitter.emit({message: 'common/action/playerKilled', replacements: [name], entities: [] })
                        }
                    });
                } else if(data.id === characterId) {
                    Bus.messageEmitter.emit({message: 'common/action/playerTookDamage', entities: [] })
                    if (data.props.current as number <= 0) {
                        Bus.messageEmitter.emit({message: 'common/action/playerDied', entities: [] })
                    }
                }
            }
        });
    }
}
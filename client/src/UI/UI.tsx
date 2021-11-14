import { Component, render } from "preact";
import { HealthComponent } from "../../../common/src/components/HealthComponent";
import { StatComponent } from "../../../common/src/components/StatComponent";
import { EventEmitter } from "../../../common/src/events/EventEmitter";
import { MessageData } from "../../../common/src/events/server/MessageEvent";
import { Game, GameSystems } from "../../../common/src/models/Game";
import { Player } from "../../../common/src/models/Player";
import { loadLibrary } from "../lang/Lang";
import { ClientGame } from "../models/ClientGame";
import { UIMessages } from "./components/UIMessages";
import { UIStatBlock } from "./components/UIStatBlock";

type UIProps = {
    game: ClientGame,
    currentPlayer: Player;
}

export class UI extends Component<UIProps> {
    playerStatComponent: StatComponent;
    playerHealthComponent: HealthComponent;
    emitters: EventEmitter<{id: number, props: Record<string, any>, oldProps: Record<string, any>}>[];
    messageEventEmitter: EventEmitter<MessageData>;

    constructor({ game, currentPlayer }: UIProps) {
        super();
        this.preloadLibraries();
        const charId = currentPlayer.characterId;
        const statComponent = game.systems.stats.getComponent(charId);
        if (statComponent) {
            this.playerStatComponent = statComponent;
        }

        const healthComponent = game.systems.health.getComponent(charId);
        if (healthComponent) {
            this.playerHealthComponent = healthComponent;
            console.log(this.playerHealthComponent);
        }
        this.emitters = [game.systems.stats.componentUpdatedEmitter, game.systems.health.componentUpdatedEmitter];
        this.messageEventEmitter = game.messageEmitter;
    }

    preloadLibraries() {
        loadLibrary('common');
    }

    render() {
        return <div>
            <UIStatBlock stats={this.playerStatComponent} componentChangedEmitters={this.emitters} health={this.playerHealthComponent} />
            <UIMessages messageEmitter={this.messageEventEmitter} />
        </div>
    }
}

export const setupUI = (game: ClientGame, currentPlayer: Player) => {
    render(<UI game={game} currentPlayer={currentPlayer} />, document.getElementById('ui') as HTMLElement);
}
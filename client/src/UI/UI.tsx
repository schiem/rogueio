import { Component, Fragment, render } from "preact";
import { HealthComponent } from "../../../common/src/components/HealthComponent";
import { StatComponent } from "../../../common/src/components/StatComponent";
import { EventEmitter } from "../../../common/src/events/EventEmitter";
import { MessageEventData } from "../../../common/src/events/server/MessageEvent";
import { Game, GameSystems } from "../../../common/src/models/Game";
import { Player } from "../../../common/src/models/Player";
import { loadLibrary } from "../lang/Lang";
import { ClientGame } from "../models/ClientGame";
import { UIMessages } from "./components/UIMessages";
import { UIStatBlock } from "./components/UIStatBlock";
import { UIDescription } from "./components/UIFocus";
import { UIInventory } from "./components/UIInventory";

type UIProps = {
    game: ClientGame,
    currentPlayer: Player;
}

export class UI extends Component<UIProps> {
    game: ClientGame;
    currentPlayer: Player;

    constructor({ game, currentPlayer }: UIProps) {
        super();
        this.preloadLibraries();
        this.game = game;
        this.currentPlayer = currentPlayer;
    }

    preloadLibraries(): void {
        loadLibrary('common');
    }

    render() {
        const charId = this.currentPlayer.characterId;
        const statComponent = this.game.systems.stats.getComponent(charId) as StatComponent;
        const healthComponent = this.game.systems.health.getComponent(charId) as HealthComponent;
        return <Fragment>
            <UIStatBlock 
                statSystem={this.game.systems.stats} 
                healthSystem={this.game.systems.health}
                playerId={this.game.players[this.game.currentPlayerId].characterId} />
            <UIMessages />
            <UIInventory
                descriptionSystem={this.game.systems.description}
                inventorySystem={this.game.systems.inventory} 
                playerId={this.game.players[this.game.currentPlayerId].characterId} />
            <UIDescription 
                changeFocusToEntity={(id) => { this.game.changeFocus(id) }}
                focusChangedEmitter={this.game.focusMaybeChangedEmitter}
                descriptionSystem={this.game.systems.description}
                locationSystem={this.game.systems.location}
                dungeon={this.game.currentLevel} />
        </Fragment>
    }
}

export const setupUI = (game: ClientGame, currentPlayer: Player): void => {
    render(<UI game={game} currentPlayer={currentPlayer} />, document.getElementById('ui') as HTMLElement);
}
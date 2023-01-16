import { Component, Fragment, render } from "preact";
import { Player } from "../../../common/src/models/Player";
import { loadLang } from "../lang/Lang";
import { ClientGame } from "../models/ClientGame";
import { UIMessages } from "./components/UIMessages";
import { UIStatBlock } from "./components/UIStatBlock";
import { UIDescription } from "./components/UIFocus";
import { UIInventory } from "./components/UIInventory";
import { Terminal } from "./components/UITerminal";

type UIProps = {
    game: ClientGame,
    currentPlayer: Player;
}

type UIState = {
    loaded: boolean;
}

export class UI extends Component<UIProps, UIState> {
    game: ClientGame;
    currentPlayer: Player;

    constructor({ game, currentPlayer }: UIProps) {
        super();
        this.game = game;
        this.currentPlayer = currentPlayer;

        this.state = {
            loaded: false
        }

    }

    componentDidMount(): void {
        this.preloadLibraries().then(() => {
            this.setState({ loaded: true });
        });
    }

    preloadLibraries(): Promise<void> {
        return loadLang();
    }

    render() {
        if (!this.state.loaded) {
            return <Fragment></Fragment>
        }

        return <Fragment>
            <Terminal classes={['ui-block']} id='stats' title='Stats'>
                <UIStatBlock 
                    statSystem={this.game.systems.stats} 
                    healthSystem={this.game.systems.health}
                    playerId={this.game.players[this.game.currentPlayerId].characterId} />
            </Terminal>
            <Terminal classes={['ui-block']} id='messages' title='Messages'>
                <UIMessages />
            </Terminal>
            <Terminal classes={['ui-block']} id='inventory' title='Inventory'>
                <UIInventory
                    descriptionSystem={this.game.systems.description}
                    inventorySystem={this.game.systems.inventory} 
                    playerId={this.game.players[this.game.currentPlayerId].characterId} />
            </Terminal>
            <Terminal classes={['ui-block']} id='description' title='Description'>
                <UIDescription 
                    changeFocusToEntity={(id) => { this.game.changeFocus(id) }}
                    focusChangedEmitter={this.game.focusMaybeChangedEmitter}
                    descriptionSystem={this.game.systems.description}
                    locationSystem={this.game.systems.location}
                    dungeon={this.game.currentLevel} />
            </Terminal>
        </Fragment>
    }
}

export const setupUI = (game: ClientGame, currentPlayer: Player): void => {
    render(<UI game={game} currentPlayer={currentPlayer} />, document.getElementById('ui') as HTMLElement);
}
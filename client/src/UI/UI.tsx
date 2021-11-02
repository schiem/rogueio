import { Component, render } from "preact";
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
    statUpdatedEmitter: EventEmitter<{id: number, props: Record<string, any>, oldProps: Record<string, any>}>;
    messageEventEmitter: EventEmitter<MessageData>;

    constructor({ game, currentPlayer }: UIProps) {
        super();
        this.preloadLibraries();
        const component = game.systems.stats.getComponent(currentPlayer.characterId);
        if (component) {
            this.playerStatComponent = component;
        }
        this.statUpdatedEmitter = game.systems.stats.componentUpdatedEmitter;
        this.messageEventEmitter = game.messageEmitter;
    }

    preloadLibraries() {
        loadLibrary('common');
    }

    render() {
        return <div>
            <UIStatBlock stats={this.playerStatComponent} componentChangedEmitter={this.statUpdatedEmitter} />
            <UIMessages messageEmitter={this.messageEventEmitter} />
        </div>
    }
}

export const setupUI = (game: ClientGame, currentPlayer: Player) => {
    render(<UI game={game} currentPlayer={currentPlayer} />, document.getElementById('ui') as HTMLElement);
}
import { Component, render } from "preact";
import { StatComponent } from "../../../common/src/components/StatComponent";
import { EventEmitter } from "../../../common/src/events/EventEmitter";
import { GameSystems } from "../../../common/src/models/Game";
import { Player } from "../../../common/src/models/Player";
import { loadLibrary } from "../lang/Lang";
import { UIMessages } from "./components/UIMessages";
import { UIStatBlock } from "./components/UIStatBlock";

type UIProps = {
    systems: GameSystems;
    currentPlayer: Player;
}

export class UI extends Component<UIProps> {
    playerStatComponent: StatComponent;
    statUpdatedEmitter: EventEmitter<{id: number, props: Record<string, any>, oldProps: Record<string, any>}>;

    constructor({ systems, currentPlayer }: UIProps) {
        super();
        this.preloadLibraries();
        const component = systems.stats.getComponent(currentPlayer.characterId);
        if (component) {
            this.playerStatComponent = component;
        }
        this.statUpdatedEmitter = systems.stats.componentUpdatedEmitter;
    }

    preloadLibraries() {
        loadLibrary('common');
    }

    render() {
        return <div>
            <UIStatBlock stats={this.playerStatComponent} componentChangedEmitter={this.statUpdatedEmitter} />
            <UIMessages />
        </div>
    }
}

export const setupUI = (systems: GameSystems, currentPlayer: Player) => {
    render(<UI systems={systems} currentPlayer={currentPlayer} />, document.getElementById('ui') as HTMLElement);
}
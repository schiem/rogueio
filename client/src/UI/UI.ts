import { GameSystems } from "../../../common/src/models/Game";
import { Player } from "../../../common/src/models/Player";
import { loadLibrary } from "../lang/Lang";
import { UIList } from "./components/UIList";
import { UIStatBlock } from "./components/UIStatBlock";
import { UITerminal } from "./components/UITerminal";

export class UI {
    private rootEl: HTMLElement;
    statBlocks: Record<string, UIStatBlock> = {
        str: new UIStatBlock({
            current: 0,
            max: 0,
            name: 'str'
        }),
        dex: new UIStatBlock({
            current: 0,
            max: 0,
            name: 'dex'
        }),
        con: new UIStatBlock({
            current: 0,
            max: 0,
            name: 'con'
        }),
    };
    constructor(systems: GameSystems, public currentPlayer: Player) {
        this.rootEl = document.getElementById('ui') as HTMLElement;
        new UITerminal('Stats', this.rootEl.querySelector('#stats') as HTMLElement, [
            this.statBlocks.str,
            this.statBlocks.dex,
            this.statBlocks.con,
        ]);

        systems.stats.addedComponentEmitter.subscribe((data) => {
            if (data.id !== this.currentPlayer.characterId) {
                return;
            }

            Object.keys(this.statBlocks).forEach((key) => {
                this.statBlocks[key].data.max = (data.component.max as any)[key];
                this.statBlocks[key].data.current = (data.component.current as any)[key];
                this.statBlocks[key].clear();
                this.statBlocks[key].render();
            });
        });
    }

    preloadLibraries() {
        loadLibrary('common');
    }
}
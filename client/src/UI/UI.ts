import { UIList } from "./components/UIList";
import { UIStatBlock } from "./components/UIStatBlock";
import { UITerminal } from "./components/UITerminal";

export class UI {
    private rootEl: HTMLElement;
    statBlock: UITerminal;
    constructor() {
        this.rootEl = document.getElementById('ui') as HTMLElement;
        this.statBlock = new UITerminal('Stats', this.rootEl.querySelector('#stats') as HTMLElement, [
            new UIStatBlock({
                current: 1,
                max: 1,
                name: 'oofums'
            })
        ]);
    }
}
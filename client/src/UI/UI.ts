import { UIList } from "./components/UIList";
import { UITerminal } from "./components/UITerminal";

export class UI {
    private rootEl: HTMLElement;
    statBlock: UITerminal;
    constructor() {
        this.rootEl = document.getElementById('ui') as HTMLElement;
        this.statBlock = new UITerminal('Stats', this.rootEl.querySelector('#stats') as HTMLElement, ['hello', 'there']);
    }
}
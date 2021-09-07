import { UIList } from "./components/UIList";

export class UI {
    private rootEl: HTMLElement;
    statBlock: UIList;
    constructor() {
        this.rootEl = document.getElementById('ui') as HTMLElement;
        this.statBlock = new UIList(this.rootEl.querySelector('#stats') as HTMLElement, ['hello', 'there']);
    }
}
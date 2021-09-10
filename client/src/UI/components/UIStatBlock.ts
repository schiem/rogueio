import { UIComponent } from "../UIComponent";

type StatBlock = {name: string, max: number, current: number};
export class UIStatBlock extends UIComponent<StatBlock> {
    constructor(data: StatBlock) {
        super(document.createElement('div'), null, data, ['statblock']);
    }

    render(): void {
        const statNameEl = document.createElement('span');
        statNameEl.textContent = this.data.name;

        const blockEl = document.createElement('span');
        blockEl.textContent = `${this.data.current}/${this.data.max}`;

        this.rootEl.appendChild(statNameEl);
        this.rootEl.appendChild(blockEl);
    }
}
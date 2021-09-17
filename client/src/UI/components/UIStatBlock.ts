import { localize } from "../../lang/Lang";
import { UIComponent } from "../UIComponent";

type StatBlock = {name: string, max: number, current: number};
export class UIStatBlock extends UIComponent<StatBlock> {
    constructor(data: StatBlock) {
        super(document.createElement('div'), null, data, ['statblock']);
    }

    render(): void {
        const statNameEl = document.createElement('span');
        localize(`common/stats/${this.data.name}`).then(localized => {
            statNameEl.textContent = localized;
        });

        const blockEl = document.createElement('span');
        blockEl.textContent = `${this.data.current}/${this.data.max}`;

        this.rootEl.appendChild(statNameEl);
        this.rootEl.appendChild(blockEl);
    }

}
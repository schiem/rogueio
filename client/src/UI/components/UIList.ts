import { UIComponent } from "../UIComponent";
import { UIListItem } from "./UIListItem";

export class UIList extends UIComponent<string[]> {
    protected children: UIListItem[];
    constructor(parentEl: HTMLElement, data: string[]) {
        super(document.createElement('ul'), parentEl, data);
    }

    render(): void {
        this.data.forEach((str) => {
            this.children.push(new UIListItem(this.rootEl, str));
        });
        this.parentEl.appendChild(this.rootEl);
    }
}
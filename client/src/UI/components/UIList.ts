import { UIComponent } from "../UIComponent";
import { UIListItem } from "./UIListItem";

export class UIList extends UIComponent<(string | UIComponent<any>)[]> {
    protected children: UIListItem[];
    constructor(parentEl: HTMLElement, data: (string | UIComponent<any>)[]) {
        super(document.createElement('ul'), parentEl, data);
    }

    render(): void {
        this.data.forEach((str) => {
            this.children.push(new UIListItem(this.rootEl, str));
        });
    }
}
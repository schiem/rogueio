import { UIComponent } from "../UIComponent";

export class UIListItem extends UIComponent<string | UIComponent<any>> {
    constructor(parentEl: HTMLElement, data: string | UIComponent<any>) {
        super(document.createElement('li'), parentEl, data);
    }

    render(): void {
        if (typeof this.data === 'string') {
            this.rootEl.textContent = this.data;
        } else {
            this.children.push(this.data);
            this.data.setParent(this.rootEl);
        }
    }
}
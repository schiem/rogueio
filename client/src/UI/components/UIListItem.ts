import { UIComponent } from "../UIComponent";

export class UIListItem extends UIComponent<string> {
    constructor(parentEl: HTMLElement, data: string) {
        super(document.createElement('li'), parentEl, data);
    }

    render(): void {
        this.rootEl.textContent = this.data;
        this.parentEl.appendChild(this.rootEl);
    }
}
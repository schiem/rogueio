import { UIComponent } from "../UIComponent";
import { UIList } from "./UIList";

export class UITerminal extends UIComponent<string[]> {
    protected titleEl: HTMLElement;
    protected contentEl: HTMLElement;
    constructor(protected title: string, parentEl: HTMLElement, data: string[]) {
        super(document.createElement('div'), parentEl, data, ['terminal']);
        console.log(title);
    }

    render(): void {
        // Set up the title
        this.titleEl = document.createElement('div');
        this.titleEl.classList.add('terminal-title');
        this.titleEl.textContent = this.title;
        console.log(this.title);
        this.rootEl.appendChild(this.titleEl);

        // Set up the content
        this.contentEl = document.createElement('div');
        this.contentEl.classList.add('terminal-content');
        this.rootEl.appendChild(this.contentEl);
        this.children = [new UIList(this.contentEl, this.data)];
    }
}
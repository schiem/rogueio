export abstract class UIComponent<Data> {
    protected children: UIComponent<any>[] = [];

    constructor(
        protected rootEl: HTMLElement, 
        protected parentEl: HTMLElement, 
        protected data: Data,
        protected classes?: string[]) {
        classes?.forEach((cssClass) => {
            this.rootEl.classList.add(cssClass);
        });

        setTimeout(() => {
            this.render();
            this.parentEl.appendChild(this.rootEl);
        })
    }

    abstract render(): void;

    clear(): void {
        if (!this.rootEl) {
            return;
        }

        while(this.rootEl.lastChild) {
            this.rootEl.removeChild(this.rootEl.lastChild);
        }
    }

    updateDataReference(data: Data): void {
        this.data = data;
        this.render();
    }
}
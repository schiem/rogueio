export abstract class UIComponent<Data> {
    protected children: UIComponent<any>[] = [];

    constructor(
        protected rootEl: HTMLElement, 
        protected parentEl: HTMLElement | null, 
        protected data: Data,
        protected classes?: string[]) {
        classes?.forEach((cssClass) => {
            this.rootEl.classList.add(cssClass);
        });

        setTimeout(() => {
            this.render();
            if (this.parentEl) {
                this.parentEl.appendChild(this.rootEl);
            }
        })
    }

    abstract render(): void;

    setParent(parentEl: HTMLElement): void {
        if (this.parentEl) {
            this.parentEl.removeChild(this.rootEl);
        }

        this.parentEl = parentEl;
        this.parentEl.appendChild(this.rootEl);
    }

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
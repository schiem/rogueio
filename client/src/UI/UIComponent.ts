export abstract class UIComponent<Data> {
    constructor(public element: HTMLElement, protected data: Data) {
        this.render();
    }

    abstract render(): void;
    updateDataReference(data: Data): void {
        this.data = data;
        this.render();
    }
}
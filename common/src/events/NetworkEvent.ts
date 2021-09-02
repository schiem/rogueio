export abstract class NetworkEvent {
    type: number;
    data: any;
    ts: number;
    constructor() {
        this.ts = new Date().getTime();
    }

    abstract serialize(): string | ArrayBuffer;
}
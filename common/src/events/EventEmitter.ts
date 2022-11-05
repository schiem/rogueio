export class EventEmitter<T> {
    currentEventId = 0;
    events: Record<number, ((data: T) => void)> = {};
    subscribe(fn: (data: T) => void): number {
        const id = this.currentEventId;
        this.events[id] = fn;
        this.currentEventId++;
        return id;
    }

    unsubscribe(id: number): void {
        delete this.events[id];
    }

    emit(data: T): void {
        Object.keys(this.events).forEach((id: string) => {
            this.events[id as unknown as number](data);
        });
    }
}
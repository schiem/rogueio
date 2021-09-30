
export class InputEvents {
    static readonly actionNames: Record<string, string> = {
        moveLeft: 'moveLeft',
        moveRight: 'moveRight',
        moveDown: 'moveDown',
        moveUp: 'moveUp'
    }

    private static defaultInputEventMap: Record<string, string> = {
        a: InputEvents.actionNames.moveLeft,
        s: InputEvents.actionNames.moveDown,
        d: InputEvents.actionNames.moveRight,
        w: InputEvents.actionNames.moveUp
    }
    private static inputEventMap: Record<string, string> = {}

    static actionForKey(key: string): string | undefined {
        if (this.inputEventMap[key]) {
            return this.inputEventMap[key];
        }

        if (this.defaultInputEventMap[key]) {
            return this.defaultInputEventMap[key];
        }

        return;
    }

    static resetActionToDefault(action: string): void {
        // unset any actions that were set
        Object.keys(this.inputEventMap).forEach(key => {
            if (this.inputEventMap[key] === action) {
                delete this.inputEventMap[key]
            }
        });
    }

    static resetAllActionsToDefault(): void {
        this.inputEventMap = {};
    }
}
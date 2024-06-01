export enum InputAction {
    moveLeft,
    moveRight,
    moveDown,
    moveUp,
    focusClosestEntity,
    focusNextEntity,
    focusPreviousEntity,
    grab
};

export class InputEvents {
    private static defaultInputEventMap: Record<string, InputAction> = {
        a: InputAction.moveLeft,
        s: InputAction.moveDown,
        d: InputAction.moveRight,
        w: InputAction.moveUp,
        c: InputAction.focusClosestEntity,
        e: InputAction.focusNextEntity,
        q: InputAction.focusPreviousEntity,
        g: InputAction.grab
    }
    private static inputEventMap: Record<string, InputAction> = {}

    static actionForKey(key: string): InputAction | undefined {
        if (this.inputEventMap[key] !== undefined) {
            return this.inputEventMap[key];
        }

        if (this.defaultInputEventMap[key] !== undefined) {
            return this.defaultInputEventMap[key];
        }

        return;
    }

    static resetActionToDefault(action: InputAction): void {
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
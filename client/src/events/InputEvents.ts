export enum InputAction {
    moveLeft,
    moveRight,
    moveDown,
    moveUp,
    focusClosestEntity,
    focusNextEntity,
}

export class InputEvents {
    static readonly actionNames: Record<InputAction, string> = {
        [InputAction.moveLeft]: 'moveLeft',
        [InputAction.moveRight]: 'moveRight',
        [InputAction.moveDown]: 'moveDown',
        [InputAction.moveUp]: 'moveUp',
        [InputAction.focusClosestEntity]: 'focusClosestEntity',
        [InputAction.focusNextEntity]: 'focusNextEntity',
    }

    private static defaultInputEventMap: Record<string, InputAction> = {
        a: InputAction.moveLeft,
        s: InputAction.moveDown,
        d: InputAction.moveRight,
        w: InputAction.moveUp,
        c: InputAction.focusClosestEntity,
        Tab: InputAction.focusNextEntity
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
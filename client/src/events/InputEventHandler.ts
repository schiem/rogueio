import { InputEvents } from "./InputEvents";
import { ClientGame } from "../models/ClientGame";

export class InputEventHandler {
    private static game: ClientGame;

    static init(game: ClientGame): void {
        this.game = game;

        InputEvents.resetAllActionsToDefault();
        document.addEventListener('keydown', (event: KeyboardEvent) => {
            let key = event.key;
            if (event.altKey) {
                key = `alt-${key}`;
            }
            if (event.ctrlKey) {
                key = `ctrl-${key}`;
            }
            const action = InputEvents.actionForKey(key);
            if (action) {
                event.preventDefault();
                this.handleEvent(action);
            }
        });
    }

    private static handleEvent(action: string): void {
        if (this.eventHandlers[action]) {
            this.eventHandlers[action]();
        }
    }

    // functions for handling input actions
    private static eventHandlers: Record<string, () => void> = {
        [InputEvents.actionNames.moveUp]: () => {
        },
        [InputEvents.actionNames.moveDown]: () => {
        },
        [InputEvents.actionNames.moveRight]: () => {
        },
        [InputEvents.actionNames.moveLeft]: () => {
        },
    };
}
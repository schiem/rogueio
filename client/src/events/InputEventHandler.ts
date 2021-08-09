import { InputEvents } from "./InputEvents";
import { ClientGame } from "../models/ClientGame";
import { LocationComponent } from "../../../common/src/components/LocationComponent";
import { generateMoveEvent } from "./EventGenerators";
import { NetworkEventHandler } from "./NetworkEventHandler";

export class InputEventHandler {
     constructor(private game: ClientGame) {
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

    private handleEvent(action: string): void {
        if (this.eventHandlers[action]) {
            this.eventHandlers[action]();
        }
    }

    // functions for handling input actions
    private eventHandlers: Record<string, () => void> = {
        [InputEvents.actionNames.moveUp]: () => {
            const event = generateMoveEvent(this.game, {x: 0, y: -1});
            if (event) {
                NetworkEventHandler.sendEvent(event);
            }
        },
        [InputEvents.actionNames.moveDown]: () => {
            const event = generateMoveEvent(this.game, {x: 0, y: 1});
            if (event) {
                NetworkEventHandler.sendEvent(event);
            }
        },
        [InputEvents.actionNames.moveRight]: () => {
            const event = generateMoveEvent(this.game, {x: 1, y: 0});
            if (event) {
                NetworkEventHandler.sendEvent(event);
            }
        },
        [InputEvents.actionNames.moveLeft]: () => {
            const event = generateMoveEvent(this.game, {x: -1, y: 0});
            if (event) {
                NetworkEventHandler.sendEvent(event);
            }
        }
    };
}
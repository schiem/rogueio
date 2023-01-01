import { InputAction, InputEvents } from "./InputEvents";
import { ClientGame } from "../models/ClientGame";
import { LocationComponent } from "../../../common/src/components/LocationComponent";
import { generateEventFromMovement } from "./EventGenerators";
import { NetworkEventHandler } from "./NetworkEventHandler";
import { CarryableComponent } from "../../../common/src/components/CarryableComponent";
import { Bus } from "../../../common/src/bus/Buses";
import { GrabEvent } from "../../../common/src/events/client/GrabEvent";

export class InputEventHandler {
     constructor(private game: ClientGame, viewport: HTMLElement) {
        InputEvents.resetAllActionsToDefault();
        document.addEventListener('keydown', (event: KeyboardEvent) => {
            let key = event.key;
            if (event.altKey) {
                key = `alt-${key}`;
            }
            if (event.ctrlKey) {
                key = `ctrl-${key}`;
            }
            if (event.shiftKey) {
                key = `shift-${key}`;
            }
            const action = InputEvents.actionForKey(key);
            if (action !== undefined) {
                event.preventDefault();
                this.handleEvent(action);
            }
        });

        // For now, hard code this - it's the only thing you can do by clicking with the mouse
        viewport.addEventListener('click', (event: MouseEvent) => {
            // Don't mess with other events
            if (event.button === 0) {
                const rects = viewport.getBoundingClientRect();
                const xDiff = event.clientX - rects.left;
                const yDiff = event.clientY - rects.top;

                const spriteSize = game.renderer.spriteSheet.spriteSize;
                const pointClicked = {x: Math.floor(xDiff / spriteSize.x), y: Math.floor(yDiff / spriteSize.y)}
                const location = game.renderer.viewPortToWorld(pointClicked);
                const entityAtLocation = game.systems.location.getHighestComponentAtLocation(location);
                if (entityAtLocation) {
                    game.changeFocus(entityAtLocation.id);
                } else {
                    game.changeFocus(location);
                }
            }
        });
    }

    private handleEvent(action: InputAction): void {
        if (this.eventHandlers[action]) {
            this.eventHandlers[action]();
        }
    }

    // functions for handling input actions
    private eventHandlers: Record<InputAction, () => void> = {
        [InputAction.moveUp]: () => {
            const event = generateEventFromMovement(this.game, {x: 0, y: -1});
            if (event) {
                NetworkEventHandler.sendEvent(event);
            }
        },
        [InputAction.moveDown]: () => {
            const event = generateEventFromMovement(this.game, {x: 0, y: 1});
            if (event) {
                NetworkEventHandler.sendEvent(event);
            }
        },
        [InputAction.moveRight]: () => {
            const event = generateEventFromMovement(this.game, {x: 1, y: 0});
            if (event) {
                NetworkEventHandler.sendEvent(event);
            }
        },
        [InputAction.moveLeft]: () => {
            const event = generateEventFromMovement(this.game, {x: -1, y: 0});
            if (event) {
                NetworkEventHandler.sendEvent(event);
            }
        },
        [InputAction.focusClosestEntity]: () => {
            const entity = this.game.findClosestEntity();
            if (entity !== undefined) {
                this.game.changeFocus(entity);
            }
        },
        [InputAction.focusNextEntity]: () => {
            const entity = this.game.findNextEntity();
            if (entity !== undefined) {
                this.game.changeFocus(entity);
            }
        },
        [InputAction.focusPreviousEntity]: () => {
            const entity = this.game.findPreviousEntity();
            if (entity !== undefined) {
                this.game.changeFocus(entity);
            }
        },
        [InputAction.grab]: () => {
            const entityId = this.game.players[this.game.currentPlayerId].characterId;
            const locationComponent = this.game.systems.location.getComponent(entityId);
            const inventoryComponent = this.game.systems.inventory.getComponent(entityId);
            if (!locationComponent || !inventoryComponent) {
                return;
            }

            const locationEntities = this.game.systems.location.getEntitiesAtLocation(locationComponent.location).filter(x => x !== entityId && this.game.systems.carryable.getComponent(x) !== undefined);
            if (locationEntities.length === 0) {
                return;
            }

            // TODO - add a way to choose which item to pick up
            if (this.game.systems.inventory.canPickUp(entityId, locationEntities[0])) {
                NetworkEventHandler.sendEvent(new GrabEvent(locationEntities[0]));
            }
        }
    };
}
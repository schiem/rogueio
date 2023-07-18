import { ServerDungeon } from "../models/ServerDungeon";
import { ServerGameSystems } from "../models/ServerGame";
import { BTNode } from "./Nodes/BTNode";

export type BTBlackboard = {
    target?: number
};

export type BTState = {
    systems: ServerGameSystems,
    dungeon: ServerDungeon,
    id: number,
    currentTime: number
}

export class BehaviorTree {
    constructor(private root: BTNode) {}
    currentExecutionState?: {
        generator: Generator<void, boolean, unknown>,
        state: BTState
    };
    run(currentTime: number, systems: ServerGameSystems, dungeon: ServerDungeon, id: number): void {
        if (this.currentExecutionState) {
            this.currentExecutionState.state.currentTime = currentTime;
            const result = this.currentExecutionState.generator.next();
            if (result.done) {
                this.currentExecutionState = undefined;
            }
        }
        else {
            const state = {
                systems, dungeon, id, currentTime 
            };
            this.currentExecutionState = {
                generator: this.root.execute(state, {}),
                state
            };
        }
    }
}
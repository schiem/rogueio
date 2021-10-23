import { Dungeon } from "../../../common/src/models/Dungeon";
import { Point } from "../../../common/src/types/Points";
import { ServerGameSystems } from "../models/ServerGame"

export enum AIType {
    passive,
    defensive,
    aggressive
}


export type AIComponent = {
    type: AIType
}

export const AIFunctions: Record<AIType, (entityId: number, component: AIComponent, systems: ServerGameSystems, dungeon: Dungeon) => void> = {
    [AIType.passive]: (entityId, component, systems, dungeon) => {
        const point: Point = {x: 0, y: 0};
        const distance = Math.random() > 0.5 ? -1 : 1;

        Math.random() > 0.5 ? point.x += distance : point.y += distance;
        systems.movement.attemptMove(entityId, point, dungeon);
    },
    [AIType.defensive]: (entityId, component, systems, dungeon) => {
        const point: Point = {x: 0, y: 0};
        const distance = Math.random() > 0.5 ? -1 : 1;

        Math.random() > 0.5 ? point.x += distance : point.y += distance;
        systems.movement.attemptMove(entityId, point, dungeon);
    },
    [AIType.aggressive]: (entityId, component, systems, dungeon) => {
        const point: Point = {x: 0, y: 0};
        const distance = Math.random() > 0.5 ? -1 : 1;

        Math.random() > 0.5 ? point.x += distance : point.y += distance;
        systems.movement.attemptMove(entityId, point, dungeon);
    },
};
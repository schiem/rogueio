import { VisibilityComponent } from "../../../common/src/components/VisibilityComponent";
import { EventEmitter } from "../../../common/src/events/EventEmitter";
import { VisibilitySystem } from "../../../common/src/systems/VisibilitySystem";
import { Point } from "../../../common/src/types/Points";
import { Tile } from "../../../common/src/types/Tile";

export class ClientVisibilitySystem extends VisibilitySystem {
    visionPointsChanged = new EventEmitter<{point: Point, tile?: Tile}[]>();

    componentPropertyUpdaters: Record<string, (id: number, component: VisibilityComponent, newValue: unknown) => unknown> = {
        added: (id: number, component: VisibilityComponent, newValue: unknown) => {
            const added = newValue as Point[];
            const old = component.visible;
            added.forEach((point) => {
                if (!component.visible[point.x]) {
                    component.visible[point.x] = {};
                }
                component.visible[point.x][point.y] = true;
                this.visionPointsChanged.emit([{point}]);
            });
            return old;
        },
        removed: (id: number, component: VisibilityComponent, newValue: unknown) => {
            const old = component.visible;
            const removed = newValue as Point[];
            removed.forEach((point) => {
                delete component.visible[point.x]?.[point.y];
                this.visionPointsChanged.emit([{point}]);
            });
            return old;
        },
        seen: (id: number, component: VisibilityComponent, newValue: unknown) => {
            const seen = newValue as Tile[];
            const sharedComponent = this.getSharedVisibilityComponent(id);
            if (!sharedComponent) {
                return;
            }

            const old = sharedComponent.seen;
            const changed:{point: Point, tile?: Tile}[]  = [];
            seen.forEach((tile) => {
                sharedComponent.seen[tile.coords.x][tile.coords.y] = true;
                // TODO - consider uncoupling this, right now it's very heavily coupled
                changed.push({point: tile.coords, tile});
            });
            this.visionPointsChanged.emit(changed);
            return old;
        },
    };

    removeComponentFromEntity(id: number): void {
        const component = this.getComponent(id);
        if (!component) {
            return;
        }
        // TODO - this really only needs to be done on the client - should we subclass it?
        const points: {point: Point, tile?: Tile}[] = [];
        for(const x in component.visible) {
            for(const y in component.visible[x]) {
                points.push({
                    point: {
                        x: parseInt(x),
                        y: parseInt(y)
                    }
                });
            }
        }

        this.visionPointsChanged.emit(points);
        super.removeComponentFromEntity(id);
    }
}
import { LocationComponent } from "../../../common/src/components/LocationComponent";
import { VisibilityComponent } from "../../../common/src/components/VisibilityComponent";
import { EntityManager } from "../../../common/src/entities/EntityManager";
import { Dungeon } from "../../../common/src/models/Dungeon";
import { AllySystem } from "../../../common/src/systems/AllySystem";
import { LocationSystem } from "../../../common/src/systems/LocationSystem";
import { VisibilitySystem } from "../../../common/src/systems/VisibilitySystem";
import { Point } from "../../../common/src/types/Points";
import { Tile } from "../../../common/src/types/Tile";
import { GetVisibleTiles } from "../utils/ShadowCast";

export class ServerVisbilitySystem extends VisibilitySystem {
    constructor(entityManager: EntityManager, allySystem: AllySystem, locationSystem: LocationSystem, private dungeon: Dungeon) {
        super(entityManager, allySystem, locationSystem, dungeon.size);

        locationSystem.componentUpdatedEmitter.subscribe((data) => {
            this.recalculateVisibility(data.id);
        });
        locationSystem.addedComponentEmitter.subscribe((data) => {
            this.recalculateVisibility(data.id);
        });
    }

    addComponentForEntity(id: number, component: VisibilityComponent): void {
        super.addComponentForEntity(id, component);
        this.recalculateVisibility(id);
    }

    getSeenTilesForEntity(entityId: number): Tile[] | undefined {
        const component = this.getSharedVisibilityComponent(entityId);
        if (!component) {
            return;
        }
        const seen: Tile[] = [];
        for(let x = 0; x < component.seen.length; x++) {
            for(let y = 0; y < component.seen.length; y++) {
                if (!component.seen[x][y]) {
                    continue;
                }

                const tile = this.dungeon.tiles[x]?.[y];
                if (tile) {
                    seen.push(tile);
                }
            }
        }
        return seen;
    }

    recalculateVisibility(entityId: number): void {
        const component: VisibilityComponent = this.getComponent(entityId);
        if (!component) {
            return;
        }
        
        // requires a location component to recalculate the visiblity
        const locationComponent: LocationComponent = this.locationSystem.getComponent(entityId);
        if (!locationComponent) {
            return;
        }

        const sharedComponent = this.getSharedVisibilityComponent(entityId);

        if (!sharedComponent) {
            return;
        }

        const currentVision = component.visible;
        const toDelete: Point[] = [];
        const toAdd: Point[] = [];
        const newSeen: Tile[] = [];

        const newVision = GetVisibleTiles(
            locationComponent.location, 
            component.sightRadius, 
            (point) => {
                return !this.dungeon.tileBlocksVision(point);
            },
            (point) => {
                if (!currentVision[point.x]?.[point.y]) {
                    toAdd.push(point);
                } else {
                    delete currentVision[point.x]?.[point.y];
                }
                if (!sharedComponent.seen[point.x][point.y]) {
                    sharedComponent.seen[point.x][point.y] = true;
                    newSeen.push(this.dungeon.tiles[point.x][point.y]);
                }
            }
        );

        // Anything remaining in currentVision is no longer visible
        for (let x in currentVision) {
            for(let y in currentVision[x]) {
                toDelete.push({ x: parseInt(x), y: parseInt(y)});
            }
        }
        component.visible = newVision;

        this.componentUpdatedEmitter.emit({id: entityId, props: { added: toAdd, removed: toDelete, seen: newSeen}, oldProps: {}});
    }

    toJSON(): any {
        return {
            entities: this.entities,
            sharedComponents: this.sharedComponents
        };
    }
}
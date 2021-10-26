import { VisibilityComponent } from "../../../common/src/components/VisibilityComponent";
import { EntityManager } from "../../../common/src/entities/EntityManager";
import { EventEmitter } from "../../../common/src/events/EventEmitter";
import { Dungeon } from "../../../common/src/models/Dungeon";
import { AllySystem } from "../../../common/src/systems/AllySystem";
import { LocationSystem } from "../../../common/src/systems/LocationSystem";
import { VisibilitySystem } from "../../../common/src/systems/VisibilitySystem";
import { Point } from "../../../common/src/types/Points";
import { Tile } from "../../../common/src/types/Tile";
import { GetVisibleTiles } from "../utils/ShadowCast";

export class ServerVisbilitySystem extends VisibilitySystem {
    entityChangedVisibilityEmitter = new EventEmitter<{entityId: number, forEntities: number[], visible: boolean}>();
    private dungeon: Dungeon;

    constructor(entityManager: EntityManager, allySystem: AllySystem, locationSystem: LocationSystem, dungeonSize: Point) {
        super(entityManager, allySystem, locationSystem, dungeonSize);

        locationSystem.componentUpdatedEmitter.subscribe((data) => {
            this.recalculateVisibility(data.id);

            // Check if any non-allies can see / no longer see and fire the event for that
            // TODO - right now this only applies to ally groups, not individuals who are not in a group
            if(data.props.location !== undefined) {
                const allyToExclude = allySystem.getComponent(data.id);
                for(const group in allySystem.groups) {
                    if(allyToExclude && group === allyToExclude.group) {
                        return;
                    }
                    const oldVisible = this.groupTileIsVisible(group, data.oldProps.location);
                    const visible = this.groupTileIsVisible(group, data.props.location);

                    if(oldVisible && !visible) {
                        this.entityChangedVisibilityEmitter.emit({
                            entityId: data.id,
                            forEntities: this.allySystem.getAlliesForGroup(group), 
                            visible: false
                        });
                    } else if(!oldVisible && visible) {
                        this.entityChangedVisibilityEmitter.emit({
                            entityId: data.id,
                            forEntities: this.allySystem.getAlliesForGroup(group), 
                            visible: true 
                        });
                    }
                }
            }
        });
        locationSystem.addedComponentEmitter.subscribe((data) => {
            this.recalculateVisibility(data.id);
        });
    }

    setDungeon(dungeon: Dungeon): void {
        this.dungeon = dungeon;
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
        const component = this.getComponent(entityId);
        if (!component) {
            return;
        }
        
        // requires a location component to recalculate the visiblity
        const locationComponent = this.locationSystem.getComponent(entityId);
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

        const allyComponent = this.allySystem.getComponent(entityId);
        const allies = allyComponent ? this.allySystem.getAlliesForGroup(allyComponent.group) : [entityId];

        const newVision = GetVisibleTiles(
            locationComponent.location, 
            component.sightRadius, 
            (point) => {
                return !this.dungeon.tileBlocksVision(point);
            },
            (point) => {
                if (!currentVision[point.x]?.[point.y]) {
                    // This point was not previously seen
                    toAdd.push(point);

                    // Check to make sure the point wasn't seen by another ally
                    if (!this.sharedTileIsVisible(entityId, point)) {
                        const components = this.locationSystem.getEntitiesAtLocation(point);
                        components.forEach((otherId) => {
                            const otherGroup = this.allySystem.getComponent(otherId);
                            if (!allyComponent || !otherGroup || allyComponent.group !== otherGroup.group) {
                                this.entityChangedVisibilityEmitter.emit({
                                    entityId: otherId,
                                    forEntities: allies,
                                    visible: true
                                });
                            }
                        });
                    }
                } else {
                    // The point was previously seen, it's not in the deleted list
                    // Anything left in currentVision at the end of this is the deleted list
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
                const point = {x: parseInt(x), y: parseInt(y)};
                toDelete.push(point);
                delete currentVision[x][y];
                // Send a signal that this group no longer has vision of the entities on this tile
                if (!this.sharedTileIsVisible(entityId, point)) {
                    const components = this.locationSystem.getEntitiesAtLocation(point);
                    components.forEach((otherId) => {
                        const otherGroup = this.allySystem.getComponent(otherId);
                        if (!allyComponent || !otherGroup || allyComponent.group !== otherGroup.group) {
                            this.entityChangedVisibilityEmitter.emit({
                                entityId: otherId,
                                forEntities: allies,
                                visible: false 
                            });
                        }
                    });
                }
            }
        }
        component.visible = newVision;

        this.componentUpdatedEmitter.emit({id: entityId, props: { added: toAdd, removed: toDelete, seen: newSeen}, oldProps: {}});
    }
}
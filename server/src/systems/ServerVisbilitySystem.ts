import { AllyGroup } from "../../../common/src/components/AllyComponent";
import { TileLocation, VisibilityComponent } from "../../../common/src/components/VisibilityComponent";
import { EntityManager } from "../../../common/src/entities/EntityManager";
import { EventEmitter } from "../../../common/src/events/EventEmitter";
import { Dungeon } from "../../../common/src/models/Dungeon";
import { AllySystem } from "../../../common/src/systems/AllySystem";
import { HealthSystem } from "../../../common/src/systems/HealthSystem";
import { InventorySystem } from "../../../common/src/systems/InventorySystem";
import { LocationSystem } from "../../../common/src/systems/LocationSystem";
import { VisibilitySystem } from "../../../common/src/systems/VisibilitySystem";
import { Point } from "../../../common/src/types/Points";
import { GetVisibleTiles } from "../utils/ShadowCast";

export class ServerVisbilitySystem extends VisibilitySystem {
    /**
     * Fires whenever an entity changes visibility.  This happens when an entity changes location, gains a location component, or loses a location component.
     */
    entityChangedVisibilityEmitter = new EventEmitter<{entityId: number, forEntities: number[], visible: boolean}>();
    private dungeon: Dungeon;

    constructor(entityManager: EntityManager, allySystem: AllySystem, locationSystem: LocationSystem, healthSystem: HealthSystem, dungeonSize: Point, inventorySystem: InventorySystem) {
        super(entityManager, allySystem, locationSystem, healthSystem, dungeonSize, inventorySystem);

        // Modifying the location forces visibility to change
        locationSystem.componentUpdatedEmitter.subscribe((data) => {
            if(data.props.location !== undefined) {
                this.entityChangedLocation(data.id, data.oldProps.location as Point | undefined, data.props.location as Point | undefined);
            }
        });

        locationSystem.addedComponentEmitter.subscribe((data) => {
            this.entityChangedLocation(data.id, undefined, data.component.location);
        });

        locationSystem.removedComponentEmitter.subscribe((data) => {
            this.entityChangedLocation(data.id, data.component.location, undefined);
        });
    }

    setDungeon(dungeon: Dungeon): void {
        this.dungeon = dungeon;
    }

    addComponentForEntity(id: number, component: VisibilityComponent): void {
        super.addComponentForEntity(id, component);
        this.recalculateVisibility(id);
    }

    getSeenTilesForEntity(entityId: number): TileLocation[] | undefined {
        const component = this.getSharedVisibilityComponent(entityId);
        if (!component) {
            return;
        }
        const seen: TileLocation[] = [];
        for(let x = 0; x < component.seen.length; x++) {
            for(let y = 0; y < component.seen[x].length; y++) {
                if (!component.seen[x][y]) {
                    continue;
                }

                const tile = this.dungeon.tiles[x]?.[y];
                if (tile) {
                    seen.push({
                        loc: { x, y },
                        tile
                    });
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
        const newSeen: TileLocation[] = [];

        const allyComponent = this.allySystem.getComponent(entityId);
        const allies = allyComponent ? this.allySystem.getAlliesForGroup(allyComponent.group) : [entityId];

        const newVision = GetVisibleTiles(
            {...locationComponent.location}, 
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
                    newSeen.push({ tile: this.dungeon.tiles[point.x][point.y], loc: { x: point.x, y: point.y } });
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
                                forEntities: this.filterAllyListWithNoVision(allies, otherId),
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

    private filterAllyListWithNoVision(allies: number[], entityId: number): number[] {
        // TODO - is there a more efficient way to do this?
        return allies.filter(x => !this.entityHasNonLocationVision(x, entityId));
    }

    private entityChangedLocation(entityId: number, oldLocation?: Point, newLocation?: Point): void {
        this.recalculateVisibility(entityId);
        // Check if any non-allies can see / no longer see and fire the event for that
        // TODO - right now this only applies to ally groups, not individuals who are not in a group
        const allyToExclude = this.allySystem.getComponent(entityId);
        for(const group in this.allySystem.groups) {
            const allyGroup = group as AllyGroup;
            if(allyToExclude && group === allyToExclude.group) {
                return;
            }
            // Check if this entity moved out of vision of any other group,
            // or if it moved into vision of any group
            const oldVisible = oldLocation === undefined ? false : this.groupTileIsVisible(allyGroup, oldLocation);
            const visible = newLocation === undefined ? false : this.groupTileIsVisible(allyGroup, newLocation);

            if(oldVisible && !visible) {
                this.entityChangedVisibilityEmitter.emit({
                    entityId,
                    forEntities: this.filterAllyListWithNoVision(this.allySystem.getAlliesForGroup(allyGroup), entityId), 
                    visible: false
                });
            } else if(!oldVisible && visible) {
                this.entityChangedVisibilityEmitter.emit({
                    entityId,
                    forEntities: this.filterAllyListWithNoVision(this.allySystem.getAlliesForGroup(allyGroup), entityId), 
                    visible: true 
                });
            }
        }
    }
}
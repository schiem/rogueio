import { LocationComponent } from "../components/LocationComponent";
import { Dungeon } from "../models/Dungeon";
import { EntityManager } from "../entities/EntityManager";
import { Point } from "../types/Points";
import { random } from "../utils/MathUtils";
import { ComponentSystem, ReplicationMode } from "./ComponentSystem";

/**
 * The system responsible for handling anything that can have a location.
 * In order to have a location in the world, it also must have a sprite to
 * represent it.
 */
export class LocationSystem extends ComponentSystem {
    replicationMode: ReplicationMode = 'visible';

    entities: Record<number, LocationComponent>;
    locationCache: number[][][];

    componentPropertyUpdaters = {
        location: (id: number, component: LocationComponent, newValue: Point) => {
            this.moveEntity(id, newValue);
        }
    };

    constructor(
        entityManager: EntityManager,
        public size: Point
    ) {
        super(entityManager);
        this.resetLocationCache();
    }

    /**
     * Associates the passed in component with the given entity. 
     */
    addComponentForEntity(id: number, component: LocationComponent): void {
        super.addComponentForEntity(id, component);
        this.addComponentToLocationCache(id, component);
    }

    /**
     * Removes the given component from the entity.
     */
    removeComponentFromEntity(id: number): void {
        this.removeComponentFromLocationCache(id);
        super.removeComponentFromEntity(id);
    }

    /**
     * As @see {@link addComponentForEntity}, but overwrites the location with a new one.
     */
    spawnComponentForEntity(id: number, component: LocationComponent, dungeon: Dungeon): void {
        const location = this.getSpawnLocation(component, dungeon);
        if (location === undefined) {
            // TODO - send a message and a disconnect
            return;
        }
        component.location = location;
        this.addComponentForEntity(id, component);
    }

    /**
     * Moves an entity to a new location. Only checks collisions if @param {collide} is true.
     * Returns whether the entity was successfully moved.
     */
    moveAndCollideEntity(id: number, location: Point, dungeon: Dungeon): boolean {
        const component: LocationComponent = this.getComponent(id);
        if (component === undefined) {
            return false;
        }

        // check if there are any collisions
        if (!this.canMoveTo(component, location, dungeon)) {
            return false;
        }

        this.moveEntity(id, location);
        return true;
    }

    /**
     * Fetches the entities present at a location
     */
    getEntitiesAtLocation(point: Point): number[] {
        return this.locationCache[point.x]?.[point.y] || [];
    }

    /**
     * Gets the highest 'level' component at a location.
     * If multiple entities are present, this will return in the order they were added. 
     * This returns the component instead of the entity because nobody cares about the entity.
     */
    getHighestComponentAtLocation(point: Point): {id: number, component: LocationComponent} | undefined {
        const entities = this.getEntitiesAtLocation(point);
        let highest: number | undefined = undefined;
        let bestComponent: {id: number, component: LocationComponent} | undefined;
        entities.forEach((entity) => {
            const component: LocationComponent = this.getComponent(entity);
            if (highest === undefined || component.layer > highest) {
                highest = component.layer;
                bestComponent = {id: entity, component};
            }
        });

        return bestComponent;
    }

    canMoveTo(component: LocationComponent, location: Point, dungeon: Dungeon): boolean {
        return !dungeon.tileIsBlocked(location, component.collisionLayer) && !this.isCollision(component, location);
    }

    postDeserialize(): void {
        this.resetLocationCache();
        Object.keys(this.entities).forEach((entity) => {
            // All keys in javascript are a string - who knows why
            const entityId = parseInt(entity);
            this.addComponentToLocationCache(entityId);
        });
    }

    toJSON(): any {
        return {
            entities: this.entities
        };
    }

    private moveEntity(id: number, newLocation: Point) {
        const component: LocationComponent = this.getComponent(id);
        if (component === undefined) {
            return false;
        }

        const oldLocation = component.location;
        this.removeComponentFromLocationCache(id);
        component.location = newLocation;
        this.addComponentToLocationCache(id, component)
        this.componentUpdatedEmitter.emit({id, props: { location: newLocation }, oldProps: {location: oldLocation}});
        return true;

    }

    private isCollision(component: LocationComponent, location: Point): boolean {
        const components = this.locationCache[location.x][location.y];
        // check if any of the components at this location collide with the current component
        return components?.find(
            (compId: number) => { 
                const comp: LocationComponent | undefined = this.getComponent(compId);
                if (!comp) {
                    return;
                }

                return component.collidesWith.indexOf(comp.collisionLayer) !== -1;
            }
        ) !== undefined;
    }

    private getSpawnLocation(component: LocationComponent, dungeon: Dungeon): Point | undefined {
        const roomsAvailable = dungeon.rooms.filter((room) => {
            return room.spawnTiles.length > 0 && component.spawns.indexOf(room.age) !== -1;
        });
        if (roomsAvailable.length === 0) {
            return;
        }

        const maxTries = 4;
        let tries = 0;
        while(tries < maxTries && roomsAvailable.length > 0) {
            tries++;
            const idx = random(0, roomsAvailable.length);
            const room = roomsAvailable[idx];
            const tiles = room.spawnTiles.filter((tile) => !dungeon.tileIsBlocked(tile, component.collisionLayer));
            if (tiles.length) {
                return tiles[random(0, tiles.length)];
            }
        }

        return;
    }

    /**
     * Adds a component to the location cache
     */
    private addComponentToLocationCache(id: number, component?: LocationComponent): void {
        if (component === undefined) {
            component = this.getComponent(id);
            if (component === undefined) {
                return;
            }
        }

        if (this.locationCache[component.location.x][component.location.y] === undefined) {
            this.locationCache[component.location.x][component.location.y] = [id];
        } else {
            this.locationCache[component.location.x][component.location.y].push(id);
        }
    }

    private removeComponentFromLocationCache(id: number) {
        const component = this.getComponent(id);
        if (component === undefined) {
            return;
        }

        // remove the element from the location in the location cache
        const idx = this.locationCache[component.location.x][component.location.y].indexOf(id);
        if (idx !== -1) {
            this.locationCache[component.location.x][component.location.y].splice(idx, 1);
        }
    }

    private resetLocationCache(): void {
        this.locationCache = new Array(this.size.x);
        for (let i = 0; i < this.size.x; i++) {
            this.locationCache[i] = new Array(this.size.y);
        }
    }

}
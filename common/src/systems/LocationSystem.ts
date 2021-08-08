import { LocationComponent } from "../components/LocationComponent";
import { Dungeon } from "../models/Dungeon";
import { EntityManager } from "../entities/EntityManager";
import { Point } from "../types/Points";
import { random } from "../utils/MathUtils";
import { ComponentSystem } from "./ComponentSystem";

/**
 * The system responsible for handling anything that can have a location.
 * In order to have a location in the world, it also must have a sprite to
 * represent it.
 */
export class LocationSystem extends ComponentSystem {
    entities: Record<number, LocationComponent>;
    locationCache: number[][][];

    componentPropertyUpdaters = {
        location: (id: number, component: LocationComponent, newValue: Point) => {
            this.moveEntity(id, newValue, false);
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
        this.addComponentToLocationCache(id, component);
        super.addComponentForEntity(id, component);
    }

    /**
     * Removes the given component from the entity.
     */
    removeComponentFromEntity(id: number): void {
        this.removeComponentFromLocation(id);
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
    moveEntity(id: number, location: Point, collide: boolean = true): boolean {
        const component = this.getComponent(id);
        if (component === undefined) {
            return false;
        }

        // check if there are any collisions
        if (collide) {
            if (this.isCollision(component, location)) {
                return false;
            }
        }

        this.removeComponentFromLocation(id);
        component.location = location;
        this.addComponentToLocationCache(id, component)
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
    getHighestComponentAtLocation(point: Point): LocationComponent | undefined {
        const entities = this.getEntitiesAtLocation(point);
        let highest: number | undefined = undefined;
        let bestComponent: LocationComponent | undefined;
        entities.forEach((entity) => {
            const component: LocationComponent = this.getComponent(entity);
            if (highest === undefined || component.layer > highest) {
                highest = component.layer;
                bestComponent = component;
            }
        });

        return bestComponent;
    }

    postDeserialize(): void {
        this.resetLocationCache();
        console.log(this.entities);
        Object.keys(this.entities).forEach((entity: any) => {
            this.addComponentToLocationCache(entity);
        });
    }

    toJSON(): any {
        return {
            entities: this.entities
        };
    }

    private isCollision(component: LocationComponent, location: Point): boolean {
        const components = this.locationCache[location.x][location.y];
        // check if any of the components at this location collide with the current component
        return components.find(
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

    private removeComponentFromLocation(id: number) {
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
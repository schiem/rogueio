import { AllyComponent, AllyGroup } from "../components/AllyComponent";
import { EntityManager } from "../entities/EntityManager";
import { ComponentSystem, ReplicationMode } from "./ComponentSystem";

/**
 * Contains all of the allies.
 * 
 * Each enttiy will have a reference to the group that it belongs to.
 * Each group of allies will have a list of entities belonging to it.
 */
export class AllySystem extends ComponentSystem<AllyComponent> {
    replicationMode: ReplicationMode = 'visible';

    // A mapping of groups to entities
    groups: Partial<Record<AllyGroup, number[]>>;
    constructor(entityManager: EntityManager) {
        super(entityManager);

        this.groups = {
            players: [],
            enemies: []
        };
    }

    addComponentForEntity(id: number, component: AllyComponent): void {
        const group = this.groups[component.group];
        if (!group || this.entities[id]) {
            return;
        }

        group.push(id);
        super.addComponentForEntity(id, component);
    }

    removeComponentFromEntity(id: number): void {
        const component = this.getComponent(id); 
        if (!component) {
            return;
        }

        const group = this.groups[component.group];
        if (group === undefined) {
            return;
        }

        // A find / splice is faster than than deleting from an 
        // object for up to ~3000 items, which we will hopefully
        // never hit.
        const idx = group.indexOf(id);
        if (idx !== -1) {
            group.splice(idx, 1);
        }

        super.removeComponentFromEntity(id);
    }

    getAlliesForEntity(id: number): number[] | undefined {
        const component = this.getComponent(id); 
        if (!component) {
            return;
        }
        return this.getAlliesForGroup(component.group);
    }

    getEnemiesForEntity(id: number): number[] | undefined {
        const component = this.getComponent(id); 
        if (!component) {
            return;
        }

        const enemies: number[] = [];
        for (const group in this.groups) {
            const allyGroup = group as AllyGroup;
            if (group === component.group || !this.groups[allyGroup]) {
                continue;
            }

            enemies.push(...this.groups[allyGroup] as number[]);
        }

        return enemies;
    }

    getAlliesForGroup(group: AllyGroup): number[] {
        return this.groups[group] || [];
    }

    entitiesAreAllies(id: number, other: number): boolean {
        const component = this.getComponent(id);
        const otherComp = this.getComponent(other);
        if (!component || !otherComp) {
            return false;
        }
        return component.group === otherComp.group;
    }
}
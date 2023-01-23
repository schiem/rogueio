import { ItemType } from "../../../common/src/components/DescriptionComponent";
import { itemEntities, SpawnEntity } from "./EntityGenerators";
import { Spawner } from "./Spawner";

export const RandomItemSpawner: Spawner = {
    requires: [],
    doSpawn: (room, dungeon, entityManager, systems) => {
        const point = room.spawnTiles[0];
        if (point === undefined) {
            return;
        }

        const components = itemEntities[ItemType.dagger]();
        if (!components.location) {
            return;
        }

        components.location.location = point;
        const id = entityManager.addNextEntity();
        SpawnEntity(id, components, systems);
    }
}
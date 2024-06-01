import { ConsumableType } from "../../../common/src/components/ConsumableComponent";
import { CharacterType, ItemType } from "../../../common/src/components/DescriptionComponent";
import { EquipmentSlot } from "../../../common/src/components/EquipmentComponent";
import { LocationComponent } from "../../../common/src/components/LocationComponent";
import { Point } from "../../../common/src/types/Points";
import { random } from "../../../common/src/utils/MathUtils";
import { consumableEntities, itemEntities, mobEntities, SpawnEntity } from "./EntityGenerators";
import { Spawner } from "./Spawner";

export const PlayerSpawner: Spawner = {
    requires: [],
    doSpawn: (room, dungeon, entityManager, systems) => {
        const components = mobEntities[CharacterType.player]();

        let location: Point | undefined = undefined;
        const locationComponent = components.location as LocationComponent;
        const tiles = room.spawnTiles.filter((tile) => !dungeon.tileIsBlocked(tile, locationComponent.movesThrough));
        if (tiles.length) {
            location = tiles[random(0, tiles.length)];
        }
        else {
            // TODO - handle the player not actually spawning in 
            return;
        }

        const id = entityManager.addNextEntity();
        locationComponent.location = location;
        SpawnEntity(id, components, systems);

        const daggerComponent = itemEntities[ItemType.dagger]();
        const daggerId = entityManager.addNextEntity();
        SpawnEntity(daggerId, daggerComponent, systems);

        const daggerComponent2 = itemEntities[ItemType.dagger]();
        const daggerId2 = entityManager.addNextEntity();
        SpawnEntity(daggerId2, daggerComponent2, systems);

        const lesserHealingPotion = consumableEntities[ConsumableType.lesserHealing]();
        const healPotId = entityManager.addNextEntity();
        SpawnEntity(healPotId, lesserHealingPotion, systems);

        systems.inventory.addItem(id, daggerId);
        systems.inventory.addItem(id, healPotId);
        systems.equipment.equip(id, daggerId2, EquipmentSlot.leftHand);
    }
} 
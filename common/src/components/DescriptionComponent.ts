import { ConsumableType } from "./ConsumableComponent";
// TODO - redo all of this, it's a garbage way to do it

export enum EntityCategory {
    character = 1,
    item,
    consumable // technically an item, but meh - this whole system is going to get replaced
}

export enum CharacterType {
    player = 1,
    bufonidWarrior,
    bufonidQueen,
    bufonidSpawn
}

export enum ItemType {
    dagger = 1
}

export type EntityKeys<T> = {
    [EntityCategory.character]: Record<CharacterType, T>,
    [EntityCategory.item]: Record<ItemType, T>,
    [EntityCategory.consumable]: Record<ConsumableType, T>,
};

export type DescriptionClass = {
    category: string;
    specific?: string;
}

export const entityDescriptions: EntityKeys<DescriptionClass> = {
    [EntityCategory.character]: {
        [CharacterType.bufonidQueen]: {
            category: 'bufonid',
            specific: 'bufonidQueen'
        },
        [CharacterType.bufonidWarrior]: {
            category: 'bufonid',
            specific: 'bufonidWarrior'
        },
        [CharacterType.bufonidSpawn]: {
            category: 'bufonid',
            specific: 'bufonidSpawn'
        },
        [CharacterType.player]: {
            category: 'player',
        }
    },
    [EntityCategory.item]: {
        [ItemType.dagger]: {
            category: 'dagger',
        }
    },
    [EntityCategory.consumable]: {
        [ConsumableType.greaterHealing]: {
            category: 'healthPotion',
            specific: 'greater'
        },
        [ConsumableType.lesserHealing]: {
            category: 'healthPotion',
            specific: 'lesser'
        }
    }
};

export type DescriptionComponent = {
    category: EntityCategory;
    id: number;
};

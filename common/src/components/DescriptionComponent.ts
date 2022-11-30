export enum EntityCategory {
    character = 1,
    item,
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
};

export type DescriptionClass = {
    category: string;
    specific?: string;
}

export type DescriptionComponent = {
    category: EntityCategory;
    id: number;
};

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
    }
};
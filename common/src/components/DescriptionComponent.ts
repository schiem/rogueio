import { EntityType } from "../../../server/src/generators/EntityGenerators";

export type DescriptionClass = {
    category: string;
    base?: string;
}

export type DescriptionComponent = {
    id: EntityType
};

export const entityDescriptions: Record<EntityType, DescriptionClass> = {
    [EntityType.bufonidQueen]: {
        category: 'bufonid',
        base: 'bufonidQueen'
    },
    [EntityType.bufonidWarrior]: {
        category: 'bufonid',
        base: 'bufonidWarrior'
    },
    [EntityType.bufonidSpawn]: {
        category: 'bufonid',
        base: 'bufonidSpawn'
    },
    [EntityType.player]: {
        category: 'player',
    }
};
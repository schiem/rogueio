import { SpriteColors, SpriteNames } from "../../../common/src/types/Sprite"

export const sprites: Record<SpriteNames, number> = {
    [SpriteNames.wall]: 3,
    [SpriteNames.rubble]: 10,
    [SpriteNames.player]: 32,
    [SpriteNames.floor]: 118,
    [SpriteNames.spawn]: 240,
    [SpriteNames.bufonid]: 65,
    [SpriteNames.water]: 243
}

export const spriteColors: Record<SpriteColors, string> = {
    [SpriteColors.default]: '#dddddd', // the default color for the floor
    [SpriteColors.grey]: '#8a8a8a', // the default 'out of vision color' - avoid it for other things
    [SpriteColors.black]: '#222222', // the background color - anything on it will be invisible
    [SpriteColors.red]: '#ff356c', 
    [SpriteColors.green]: '#3cb44b', 
    [SpriteColors.yellow]: '#ffe119',
    [SpriteColors.blue]: '#5e9dff',
    [SpriteColors.orange]: '#f58231',
    [SpriteColors.purple]: '#c229f1',
    [SpriteColors.cyan]: '#42d4f4',
    [SpriteColors.magenta]: '#f032e6',
    [SpriteColors.lime]: '#bfef45',
    [SpriteColors.pink]: '#ff90b9',
    [SpriteColors.teal]: '#469990',
    [SpriteColors.lavender]: '#dcbeff',
    [SpriteColors.brown]: '#bd7d33',
    [SpriteColors.beige]: '#f3eca9',
    [SpriteColors.mint]: '#aaffc3',
    [SpriteColors.olive]: '#9c9c05',
    [SpriteColors.apricot]: '#ffd8b1',
    [SpriteColors.navy]: '#7e85d6',
}
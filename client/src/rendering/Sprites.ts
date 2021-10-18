import { SpriteColor, SpriteName } from "../../../common/src/types/Sprite"

export const Sprites: Record<SpriteName, number> = {
    [SpriteName.wall]: 3,
    [SpriteName.rubble]: 10,
    [SpriteName.player]: 32,
    [SpriteName.floor]: 118,
    [SpriteName.spawn]: 240,
    [SpriteName.bufonid]: 66,
    [SpriteName.water]: 243
}

export const SpriteColors: Record<SpriteColor, string> = {
    [SpriteColor.default]: '#dddddd', // the default color for the floor
    [SpriteColor.grey]: '#8a8a8a', // the default 'out of vision color' - avoid it for other things
    [SpriteColor.black]: '#222222', // the background color - anything on it will be invisible
    [SpriteColor.red]: '#ff356c', 
    [SpriteColor.green]: '#3cb44b', 
    [SpriteColor.yellow]: '#ffe119',
    [SpriteColor.blue]: '#5e9dff',
    [SpriteColor.orange]: '#f58231',
    [SpriteColor.purple]: '#c229f1',
    [SpriteColor.cyan]: '#42d4f4',
    [SpriteColor.magenta]: '#f032e6',
    [SpriteColor.lime]: '#bfef45',
    [SpriteColor.pink]: '#ff90b9',
    [SpriteColor.teal]: '#469990',
    [SpriteColor.lavender]: '#dcbeff',
    [SpriteColor.brown]: '#bd7d33',
    [SpriteColor.beige]: '#f3eca9',
    [SpriteColor.mint]: '#aaffc3',
    [SpriteColor.olive]: '#9c9c05',
    [SpriteColor.apricot]: '#ffd8b1',
    [SpriteColor.navy]: '#7e85d6',
}
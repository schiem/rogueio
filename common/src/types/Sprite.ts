export enum SpriteNames {
    wall,
    rubble,
    player,
    floor,
    spawn,
    bufonid,
    water,
}
export enum SpriteColors {
    default,
    grey,
    black,
    red,
    green,
    yellow,
    blue,
    orange,
    purple,
    cyan,
    magenta,
    lime,
    pink,
    teal,
    lavender,
    brown,
    beige,
    mint,
    olive,
    apricot,
    navy,
}
export type Sprite = {
    name: SpriteNames,
    color: SpriteColors 
};
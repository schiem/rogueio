export enum SpriteName {
    wall,
    rubble,
    player,
    floor,
    spawn,
    bufonid,
    water,
    dagger
}
export enum SpriteColor {
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
    white
}
export type Sprite = {
    name: SpriteName,
    color: SpriteColor,
};
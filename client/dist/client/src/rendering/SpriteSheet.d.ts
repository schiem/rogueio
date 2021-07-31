import { Point } from "../../../common/src/types/Points";
export declare class SpriteSheet {
    spriteSize: Point;
    spriteSheetSrc: string;
    spriteNames: Record<string, number>;
    sheetElement: HTMLImageElement;
    numSprites: number;
    ready: boolean;
    onReadyFunctions: (() => void)[];
    constructor(spriteSize: Point, spriteSheetSrc: string, spriteNames: Record<string, number>);
    onReady(func: () => void): void;
}

import { Point } from "../../../common/src/types/Points";

export class SpriteSheet {
    sheetElement: HTMLImageElement;
    numSprites: number = 0;
    ready = false;
    onReadyFunctions: (() => void)[] = [];

    constructor(
        public spriteSize: Point,
        public spriteSheetSrc: string,
        public spriteNames: Record<string, number>
    ) {
        this.sheetElement = new Image();
        this.sheetElement.src = spriteSheetSrc;
        this.sheetElement.onload = () => {
            this.ready = true;
            this.numSprites = (this.sheetElement.width / this.spriteSize.x) * (this.sheetElement.height / this.spriteSize.y);
            this.onReadyFunctions.forEach(func => {
                func();
            });
            this.onReadyFunctions = [];
        }
    }

    onReady(func: () => void) {
        if(this.ready) {
            func();
        } else {
            this.onReadyFunctions.push(func);
        }
    }
}

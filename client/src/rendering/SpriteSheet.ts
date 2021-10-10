import { Point } from "../../../common/src/types/Points";
import { SpriteColor, SpriteName } from "../../../common/src/types/Sprite";

export class SpriteSheet {
    defaultSheetElement: HTMLImageElement;
    tintedSheets: Record<SpriteColor, HTMLCanvasElement>;
    numSprites: number = 0;
    ready = false;
    onReadyFunctions: (() => void)[] = [];

    constructor(
        public spriteSize: Point,
        spriteSheetSrc: string,
        public spriteNames: Record<SpriteName, number>,
        public spriteColors: Record<SpriteColor, string>
    ) {
        this.defaultSheetElement = new Image();
        this.defaultSheetElement.src = spriteSheetSrc;
        this.defaultSheetElement.onload = () => {
            this.ready = true;
            this.numSprites = (this.defaultSheetElement.width / this.spriteSize.x) * (this.defaultSheetElement.height / this.spriteSize.y);

            this.tintedSheets = {} as Record<SpriteColor, HTMLCanvasElement>;
            for(let colorName in spriteColors) {
                const color = spriteColors[colorName as unknown as SpriteColor];
                this.tintedSheets[colorName as unknown as SpriteColor] = this.tintImage(this.defaultSheetElement, color);
            }

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

    /**
     * Tints an image to the color passed in 
     */
    tintImage(img: HTMLImageElement, color: string, alpha = 1.0): HTMLCanvasElement {
        // Create a buffer element to draw based on the Image img
        const buffer = document.createElement('canvas');
        buffer.width = img.width;
        buffer.height = img.height;
        const btx = buffer.getContext('2d');
        if (!btx) {
            throw new Error('Could not get buffer from image');
        }

        // First draw your image to the buffer
        btx.drawImage(img, 0, 0);

        // Now we'll multiply a rectangle of your chosen color
        btx.fillStyle = color;
        btx.globalCompositeOperation = 'multiply';
        btx.fillRect(0, 0, buffer.width, buffer.height);

        // Finally, fix masking issues you'll probably incur and optional globalAlpha
        btx.globalAlpha = alpha;
        btx.globalCompositeOperation = 'destination-in';
        btx.drawImage(img, 0, 0);
        return buffer;
    }
}

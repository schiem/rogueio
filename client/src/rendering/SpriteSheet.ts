import { Point } from "../../../common/src/types/Points";

export class SpriteSheet {
    defaultSheetElement: HTMLImageElement;
    tintedSheets: Record<string, HTMLCanvasElement> = {};
    numSprites: number = 0;
    ready = false;
    onReadyFunctions: (() => void)[] = [];

    constructor(
        public spriteSize: Point,
        spriteSheetSrc: string,
        public spriteNames: Record<string, number>,
        public spriteColors: Record<string, string>
    ) {
        this.defaultSheetElement = new Image();
        this.defaultSheetElement.src = spriteSheetSrc;
        this.defaultSheetElement.onload = () => {
            this.ready = true;
            this.numSprites = (this.defaultSheetElement.width / this.spriteSize.x) * (this.defaultSheetElement.height / this.spriteSize.y);

            for(let colorName in spriteColors) {
                const color = spriteColors[colorName];
                this.tintedSheets[colorName] = this.tintImage(this.defaultSheetElement, color);
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

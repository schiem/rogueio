import { ViewPort } from "./rendering/ViewPort";
import { SpriteSheet } from "./rendering/SpriteSheet";
import { RandomBSP } from "../../common/src/utils/BSP";

const canvas: HTMLCanvasElement = document.getElementById('viewport') as HTMLCanvasElement;
const spriteWidth = 14;
const spriteHeight = 25;
const spriteSheet = new SpriteSheet(spriteWidth, spriteHeight, '/dist/assets/img/fira_code_regular_14.png');
const viewport = new ViewPort({x: 256, y: 128}, spriteSheet, canvas);

spriteSheet.onReady(() => {
    const bsp: RandomBSP = new RandomBSP({x: 0, y: 0}, {x: viewport.size.x - 1, y: viewport.size.y - 1});
    bsp.split(8, 16);
    const rectangles = bsp.getChildRectangles();
    console.log(rectangles.length);
    rectangles.forEach((rectangle) => {
        spriteSheet.drawRectangle(3, rectangle, viewport.ctx); 
    });
});

import { ViewPort } from "./rendering/ViewPort";
import { SpriteSheet } from "./rendering/SpriteSheet";
import { RandomBSP } from "../../common/src/utils/BSP";
import { random } from "../../common/src/utils/MathUtils";

const canvas: HTMLCanvasElement = document.getElementById('viewport') as HTMLCanvasElement;
const spriteWidth = 14;
const spriteHeight = 25;
const maxRoomSize = {x: 22, y: 12};
const minRoomSize = {x: 8, y: 4};
const padding = 2;
const spriteSheet = new SpriteSheet(spriteWidth, spriteHeight, '/dist/assets/img/fira_code_regular_14.png');
const viewport = new ViewPort({x: 256, y: 128}, spriteSheet, canvas);

spriteSheet.onReady(() => {
    const bsp: RandomBSP = new RandomBSP({x: 0, y: 0}, {x: viewport.size.x - 1, y: viewport.size.y - 1});
    bsp.split({
        x: minRoomSize.x + padding,
        y: minRoomSize.y + padding
     }, {
        x: maxRoomSize.x + padding,
        y: maxRoomSize.y + padding
     });

    bsp.prune((child) => {
        return child.isLeaf && Math.random() > 0.6;
    });

    bsp.transform((child) => {
        const width = random(minRoomSize.x, child.rect.size.x > maxRoomSize.x ? maxRoomSize.x : child.rect.size.x);
        const height = random(minRoomSize.y, child.rect.size.y > maxRoomSize.y ? maxRoomSize.y : child.rect.size.y);
        const xOffset = random(0, child.rect.size.x - width);
        const yOffset = random(0, child.rect.size.y - height);
        child.rect.size = {x: width, y: height};
        child.rect.location = {x: child.rect.location.x + xOffset, y: child.rect.location.y + yOffset};
    });

    const rectangles = bsp.getChildRectangles();
    rectangles.forEach((rectangle) => {
        spriteSheet.drawRectangle(3, rectangle, viewport.ctx); 
    });
});

import { Point } from "../../../common/src/types/Points";

export const BresenhamCircle = (location: Point, radius: number): Point[] => {
    const points: Point[] = [];
    const startX = location.x;
    const startY = location.y;
    let x = radius;
    let y = 0;
    let error = 1 - x;

    while(x >= y) {
        points.push({ x: x + startX, y: y + startY});
        points.push({ x: y + startX, y: x + startY});
        points.push({ x: -x + startX, y: y + startY});
        points.push({ x: -y + startX, y: x + startY});
        points.push({ x: -x + startX, y: -y + startY});
        points.push({ x: -y + startX, y: -x + startY});
        points.push({ x: x + startX, y: -y + startY});
        points.push({ x: y + startX, y: -x + startY});
        
        y++;
        if(error < 0) {
            error += (2*y + 1);
        } else {
            x--;
            error += (2*(y-x + 1));
        }
    } 
    return points;
};

/**
 * Raycast a point out
 * @param start The place to start.
 * @param end The place to end.
 * @param fn A function to test whether the raycast was blocked. Expects the function to return true if there was a collision.
 * @returns True if there was a collision, false if there was not.
 */
export const BresenhamRayCast = (start: Point, end: Point, fn: (point: Point) => boolean): boolean => {
    const steep = (Math.abs(end.y - start.y) > Math.abs(end.x - start.x));

    if(steep) {
        const intermediate = [start.x, end.x];
        start.x = start.y;
        start.y = intermediate[0];
        end.x = end.y;
        end.y = intermediate[1];
    }

    const deltax = Math.abs(end.x - start.x);
    const deltay = Math.abs(end.y - start.y);
    let error = deltax / 2;
    let y = start.y;
    let inc;
    if (start.x < end.x) {
        inc = 1;
    } else {
        inc = -1;
    }

    let ystep;
    if (start.y < end.y) {
        ystep = 1;
    } else {
        ystep = -1;
    }

    for(let x = start.x; x != end.x; x += inc) {
        let current_point;
        if(steep) {
            current_point = {x: y, y: x};
        } else {
            current_point = {x, y};
        }

        if (fn && fn(current_point)) {
            return true;
        }

        error = error - deltay;
        if (error < 0) {
            y = y + ystep;
            error = error + deltax;
        }
    }
    return false;
}
import { Point } from "../../../common/src/types/Points";

type Row = {
    depth: number,
    startSlope: number,
    endSlope: number
};

export const GetVisibleTiles = (start: Point, radius: number, isVisible: (point: Point) => boolean, onVisibleFound: (point: Point) => void): Record<number, Record<number, boolean>> => {
    const shadowCast = new ShadowCast(start, radius, isVisible, onVisibleFound);
    return shadowCast.visibleTiles;
}

/**
 * This algorithm casts out in a cone in front of it, skipping any areas beyond where an obstacle is encountered.
 * This is faster than raycasting out to Bresenham circles, and covers more cases.
 * 
 * This has several checks beyond the naive implementation, most notably being a check for symmetry.
 * 
 * For more information, see here:
 * https://www.albertford.com/shadowcasting/
 */
class ShadowCast {
    // Cache the squared radius, to avoid extra calculations
    private rSquared: number;

    // Since the shadows are only cast in an arc, rotate the computed values
    // in order to get full circular coverage
    private rotate: (point: Point) => Point;

    // The visible tiles produced by running the algorithm
    visibleTiles: Record<number, Record<number, boolean>>;

    constructor(
        private start: Point,
        private radius: number,
        private isVisible: (point: Point) => boolean,
        private onVisibleFound: (point: Point) => void,
    ) {
        this.rSquared = radius * radius;

        this.visibleTiles = {};

        // Create the rotation functions
        this.markPointVisible(start);
        [
            (point: Point) => point,
            (point: Point) => {
                return {x: point.x, y: -1 * point.y};
            },
            (point: Point) => {
                return {x: point.y, y: point.x};
            },
            (point: Point) => {
                return {x: -1 * point.y, y: point.x};
            }
        ].forEach((fn) => {
            const startRow = {
                depth: 1,
                startSlope: -1,
                endSlope: 1
            };
            this.rotate = fn;
            this.scan(startRow);
        });
    }

    /**
     * Rotates a point, and then transforms it into global coords
     */
    private transform(point: Point): Point {
        const rotated = this.rotate(point);
        return {
            x: rotated.x + this.start.x,
            y: rotated.y + this.start.y
        }
    }

    /**
     * Sets a point as visible 
     */
    private markPointVisible(point: Point) {
        if (!this.visibleTiles[point.x]) {
            this.visibleTiles[point.x] = {};
        } else if(this.visibleTiles[point.x][point.y]) {
            return;
        }

        this.visibleTiles[point.x][point.y] = true;
        this.onVisibleFound(point);
    }

    /**
     * Calculates the "slope." This function is weird magic,
     * see the above reference for a better explanation
     */
    private slope(point: Point): number {
        return ((2 * point.x) - 1) / (2 * point.y);
    }

    /**
     * Checks whether a tile can "see" the original tile 
     */
    private isSymmetric(row: Row, tile: Point): boolean {
        return tile.x >= (row.depth * row.startSlope) && tile.x <= (row.depth * row.endSlope);
    }

    /**
     * Tiles on the lower end should be rounded up. 
     * This differes from Math.round by changing what the 0.5 does.
     */
    private roundTiesUp(n: number): number {
        return Math.floor(n + 0.5);
    }

    /**
     * Tiles on the upper end should be rounded down. 
     * This differes from Math.round by changing what the 0.5 does.
     */
    private roundTiesDown(n: number): number {
        return Math.ceil(n - 0.5);
    }

    /**
     * Returns the difference between a point and the start, squared.
     * Expects transform to have been called on the point. 
     */
    private distSquared(point: Point): number {
        const xDiff = (point.x - this.start.x);
        const yDiff = (point.y - this.start.y);
        return (xDiff * xDiff) + (yDiff * yDiff);
    }

    /**
     * Recursively scans rows for obstacles.
     * For more information about how this works, see the above reference. 
     */
    private scan(row: Row) {
        // If the depth has been exceeded, bail.
        if (row.depth > this.radius) {
            return;
        }

        // Declare some variables to be used later.
        // These are not just the inverse of one another, because
        // they are both false when the previous tile does not yet exist.
        let prevIsBlocked: boolean = false;
        let prevIsOpen: boolean = false;

        // Calculate the range of tiles to iterate over.
        const start = this.roundTiesUp(row.depth * row.startSlope) 
        const end = this.roundTiesDown(row.depth * row.endSlope) + 1;
        for(let i = start; i < end; i++) {
            // Find and transform the start point
            const point = {
                x: i,
                y: row.depth
            };
            const transformedPoint = this.transform(point);

            // Convert the square into a circle by checking for points
            // inside the radius
            if (this.distSquared(transformedPoint) >= this.rSquared) {
                continue;
            }

            // Check if the point is visible
            const visible = this.isVisible(transformedPoint);

            // The first wall OR symmetric point encountered is visible
            if (!visible || this.isSymmetric(row, point)) {
                this.markPointVisible(transformedPoint);
            }

            // The previous point was blocked and this one was visible
            // Adjust the slope for the next row to compensate
            if (prevIsBlocked && visible) {
                row.startSlope = this.slope(point);
            }

            // The previous tile is open, but this one is not
            // Begin to iterate over the next row, ending at the current tile
            if (prevIsOpen && !visible) {
                const nextRow: Row = {
                    depth: row.depth + 1,
                    startSlope: row.startSlope,
                    endSlope: this.slope(point)
                };

                this.scan(nextRow);
            }

            prevIsOpen = visible;
            prevIsBlocked = !prevIsOpen;
        }

        // Move onto the next row, but only if the final tile was open
        if (prevIsOpen) {
            this.scan({
                depth: row.depth + 1,
                startSlope: row.startSlope,
                endSlope: row.endSlope
            });
        }
    }
}
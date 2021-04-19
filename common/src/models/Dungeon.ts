import { Item } from "./Item";

import { Character } from "./Character";
import { Tile, TileFactory } from "../types/Tile";
import { tileDefinitions } from "../consts/TileDefinitions";
import { Point } from "../types/Points";
import { Rectangle } from "./Rectangle";
import { Room } from "./Room";
import { random } from "../utils/MathUtils";

export class Dungeon {
    items: Item[] = [];
    characters: Character[] = [];
    tiles: Tile[][] = [];
    rooms: Room[] = [];

    constructor(public size: Point) {
    }
}

export class DungeonGenerator {
    constructor(
        public dungeonSize: Point,
        public minRoomSize: Point,
        public maxRoomSize: Point,
        public minRoomSpacing: number,
        public maxRoomSpacing: number,
        public roomCreateAttempts: number,
    ) { }

    generate(): Dungeon {
        const wallTile = tileDefinitions.wall;
        //Dungeon generation happens here

        //generate the first room
        const dungeon = new Dungeon(this.dungeonSize);
        dungeon.tiles = new Array(this.dungeonSize.x);
        for (let i = 0; i < dungeon.tiles.length; i++) {
            dungeon.tiles[i] = (new Array(this.dungeonSize.y));
            for (let j = 0; j < dungeon.tiles[i].length; j++) {
                dungeon.tiles[i][j] = TileFactory.generateTile({ x: i, y: j }, wallTile);
            }
        }
        this.generateDungeonRooms(dungeon);

        return dungeon;

    }

    generateDungeonRooms(dungeon: Dungeon): void {
        const possibleRooms: Room[] = [];

        for (let i = 0; i < this.roomCreateAttempts; i++) {
            if (dungeon.rooms.length === 0) {
                //generate the first room 
                const size = {
                    x: random(this.minRoomSize.x, this.maxRoomSize.x),
                    y: random(this.minRoomSize.y, this.maxRoomSize.y)
                };

                const location = {
                    x: random(0, this.dungeonSize.x - size.x),
                    y: random(0, this.dungeonSize.y - size.y)
                };
                const room = new Room(
                    new Rectangle(location, size)
                );
                this.addRoomToDungeon(room, dungeon);
                possibleRooms.push(room);
            } else {
                //generate a random room
                //get a random room to start from
                const startIndex = random(0, possibleRooms.length);
                const startRoom = possibleRooms[startIndex];

                //generate the size first
                const size = {
                    x: random(this.minRoomSize.x, this.maxRoomSize.x),
                    y: random(this.minRoomSize.y, this.maxRoomSize.y)
                };

                //generate how far away the room is from the point
                const dist = random(this.minRoomSpacing, this.maxRoomSpacing);

                const newPoint = this.pointAtDistance(startRoom.rect, dist);

                // construct a new rectangle
                const newRect = new Rectangle(
                    {
                        x: newPoint.x > startRoom.rect.location.x ? newPoint.x : newPoint.x - size.x,
                        y: newPoint.y > startRoom.rect.location.y ? newPoint.y : newPoint.y - size.y,
                    },
                    size
                );
                const newBR = newRect.bottomRight;

                if (newRect.location.x < 0 || newRect.location.y < 0 || newBR.x >= this.dungeonSize.x || newBR.y >= this.dungeonSize.y) {
                    //some portion of the rectangle is out of bounds, ignore this one
                    continue;
                }

                //at a glance, this appears to be N^2
                //the aggressive pruning actually results in this being nlog(n)
                //making it much faster than a quad tree
                const overlappingRect = dungeon.rooms.find((room) => {
                    return room.rect.distanceTo(newRect) < 2;
                });

                if (overlappingRect === undefined) {
                    //no rectangles overlapping, add this point to the list
                    const room = new Room(newRect);
                    possibleRooms.push(room);
                    if (startRoom.connections.length >= 3) {
                        possibleRooms.slice(startIndex, 1);
                    }
                    this.addRoomToDungeon(room, dungeon, startRoom);
                }
            }
        }
    }

    private addRoomToDungeon(room: Room, dungeon: Dungeon, startRoom?: Room): void {
        dungeon.rooms.push(room);
        const bottomRight = room.rect.bottomRight;
        for(let x = room.rect.location.x; x < bottomRight.x; x++) {
            for(let y = room.rect.location.y; y < bottomRight.y; y++) {
                dungeon.tiles[x][y].definition = undefined;
            }
        }

        if(startRoom !== undefined) {
            room.connections.push(startRoom);
            startRoom.connections.push(room);

            // choose a random spot on the start room
            // 2 scenarios
            //   * rooms overlap in one dimension 
            //   * rooms have no overlap
            const startBr = startRoom.rect.bottomRight;
            const startPoint: Point = {x: 0, y: 0};
            const endPoint: Point = {x: 0, y: 0};
            const nextDirection: Point = {x: 0, y: 0};
            // 0 = x, 1 = y
            let generateDirection: number;
            if(
                startBr.x >= room.rect.topLeft.x && startRoom.rect.topLeft.x <= bottomRight.x
            ) {
                //rooms overlap in the x
                generateDirection = 0;
            } else if(
                startBr.y >= room.rect.topLeft.y && startRoom.rect.topLeft.y <= bottomRight.y
            ) {
                //rooms overlap in the y
                generateDirection = 1;
            } else {
                generateDirection = random(0, 2);
            }

            if(generateDirection === 0) {
                startPoint.x = random(startRoom.rect.location.x + 1, startBr.x - 1);
                endPoint.x = random(room.rect.location.x + 1, bottomRight.x - 1); 
                if (startRoom.rect.location.y < room.rect.location.y) {
                    //bottom of the start room connects to top of the end room
                    startPoint.y = startBr.y;
                    endPoint.y = room.rect.location.y;
                    nextDirection.y = 1;
                } else {
                    //top of the start room connects to bottom of the end room
                    startPoint.y = startRoom.rect.location.y;
                    endPoint.y = bottomRight.y;
                    nextDirection.y = -1;
                }
            } else {
                startPoint.y = random(startRoom.rect.location.y + 1, startBr.y - 1);
                endPoint.y = random(room.rect.location.y + 1, bottomRight.y - 1);
                if (startRoom.rect.location.x < room.rect.location.x) {
                    //right of the start room connects to the left of the end room
                    startPoint.x = startBr.x;
                    endPoint.x = room.rect.location.x;
                    nextDirection.x = 1;
                } else {
                    //left of the start room connects to the right of the end room
                    startPoint.x = startRoom.rect.location.x;
                    endPoint.x = bottomRight.x;
                    nextDirection.x = -1;
                }
            }

            // connect them
            const points: Point[] = [];
            let newPoint = startPoint;
            while(newPoint.x !== endPoint.x || newPoint.y !== endPoint.y) {
                dungeon.tiles[newPoint.x][newPoint.y].definition = undefined;
                points.push(newPoint);
                newPoint = {x: newPoint.x + nextDirection.x, y: newPoint.y + nextDirection.y}

                if(nextDirection.x !== 0 && newPoint.x === endPoint.x) {
                    nextDirection.x = 0;
                    nextDirection.y = newPoint.y < endPoint.y ? 1 : -1;
                } else if(nextDirection.y !== 0 && newPoint.y === endPoint.y) {
                    nextDirection.y = 0;
                    nextDirection.x = newPoint.x < endPoint.x ? 1 : -1;
                }
            }
            points.push(endPoint);
            dungeon.tiles[endPoint.x][endPoint.y].definition = undefined;
        }
    }

    private pointAtDistance(rect: Rectangle, dist: number): Point {
        // fetch a random point on the perimeter
        const perimPoint = this.randomPerimeterPoint(rect);

        //draw a line from the center of the rectangle through the perimeter point, and then keep going X distance
        const center = rect.center;
        const riseRun = {
            x: perimPoint.x - center.x,
            y: perimPoint.y - center.y
        }
        const hypotenuse = Math.sqrt(riseRun.x * riseRun.x + riseRun.y * riseRun.y);
        const ratio = dist / hypotenuse;
        const offset = {
            x: Math.round(riseRun.x * ratio),
            y: Math.round(riseRun.y * ratio)
        };

        return {
            x: perimPoint.x + offset.x,
            y: perimPoint.y + offset.y
        };
    }

    private randomPerimeterPoint(rect: Rectangle): Point {
        //find a point on the perimeter of the rectangle.  This is done by choosing a random value
        //that corresonds to the number of points, and then lining it up with where it would go
        //  0123
        //  8  10
        //  9  11
        //  4567
        const perimeterLength = (rect.size.x * 2 + rect.size.y * 2) - 4;
        const flattenedPerimPoint = random(0, perimeterLength);
        const perimPoint = { x: 0, y: 0 };

        //determine which side the point is on
        const diff = flattenedPerimPoint - rect.size.x * 2;
        if (diff < 0) {
            //either on the top or bottom - y will be either 0 or max, x will be the modulo of the index
            perimPoint.y = flattenedPerimPoint < rect.size.x - 1 ? 0 : rect.size.y - 1;
            perimPoint.x = flattenedPerimPoint % rect.size.x;
        } else {
            //either on the left or right - x will be either 0 or max, y will be module of the diff
            perimPoint.x = diff < rect.size.y - 2 ? 0 : rect.size.x - 1;

            //subtract 2 because our y indices are 2 shorter than the x (see diagram), and add 1 to account for the index offset
            perimPoint.y = (diff % (rect.size.y - 2)) + 1;
        }
        return {
            x: perimPoint.x + rect.location.x,
            y: perimPoint.y + rect.location.y
        };
    }
}
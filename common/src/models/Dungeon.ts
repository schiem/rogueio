import { Item } from "./Item";

import { Character } from "./Character";
import { Tile } from "../types/Tile";
import { tileDefinitions } from "../consts/TileDefinitions";
import { Point } from "../types/Points";
import { QuadTree } from "../utils/QuadTree";
import { Rectangle } from "./Rectangle";
import { Room } from "./Room";
import { random } from "../utils/MathUtils";
import { start } from "repl";

export class Dungeon {
    items: Item[] = [];
    characters: Character[] = [];
    tiles: (Tile | undefined)[][];

    constructor(tiles: (Tile | undefined)[][], public rooms: Room[]) {
        this.tiles = tiles;
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
    ) {}

    generate(): Dungeon {
        const wallTile = tileDefinitions.wall;
        //Dungeon generation happens here

        //generate the first room
        const rooms = this.generateRooms();
        console.log(rooms);

        return new Dungeon([], rooms.rooms);
    }

    generateRooms(): {rooms: Room[], connections: [Room, Room][]} {
        const rooms: Room[] = [];
        const connections: [Room, Room][] = [];
        const possibleRooms: Room[] = [];

        for(let i = 0; i < this.roomCreateAttempts; i++) {
            if(rooms.length === 0) {
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
                rooms.push(room);
                possibleRooms.push(room);
            } else {
                //generate a random room
                //get a random room to start from
                const startIndex = random(0, rooms.length);
                const startRoom = possibleRooms[startIndex];

                //generate the size first
                const size = {
                    x: random(this.minRoomSize.x, this.maxRoomSize.x), 
                    y: random(this.minRoomSize.y, this.maxRoomSize.y)
                };

                // fetch a random point on the perimeter
                const perimPoint = this.randomPerimeterPoint(startRoom.rect);

                //generate how far away the room is from the point
                const dist = random(this.minRoomSpacing, this.maxRoomSpacing);

                //draw a line from the center of the rectangle through the perimeter point, and then keep going X distance
                const center = startRoom.rect.center;
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
                const newPoint = {
                    x: perimPoint.x + offset.x,
                    y: perimPoint.y + offset.y
                }

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
                const overlappingRect = rooms.find((room) => {
                    return room.rect.distanceTo(newRect) < 2;
                });

                if(overlappingRect === undefined) {
                    //no rectangles overlapping, add this point to the list
                    const room = new Room(newRect);
                    rooms.push(room);
                    possibleRooms.push(room);
                    room.connections.push(startRoom);
                    startRoom.connections.push(room);
                    connections.push([startRoom, room]);
                    if (startRoom.connections.length >= 3) {
                        possibleRooms.slice(startIndex, 1);
                    }
                }
            }
        }

        return {rooms, connections};
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
        const perimPoint = {x: 0, y: 0};

        //determine which side the point is on
        const diff = flattenedPerimPoint - rect.size.x * 2;
        if(diff < 0) {
            //either on the top or bottom - y will be either 0 or max, x will be the modulo of the index
            perimPoint.y  = flattenedPerimPoint < rect.size.x - 1 ? 0 : rect.size.y - 1;
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
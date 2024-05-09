import { Point } from "../../../common/src/types/Points";
import { random, randomEnum } from "../../../common/src/utils/MathUtils";
import { Rectangle } from "../../../common/src/models/Rectangle";
import { MovementType, TileName } from "../../../common/src/types/Tile";
import { Room } from "../models/Room";
import { ServerDungeon } from "../models/ServerDungeon";
import { RoomToTypeConverters, RoomType } from "../models/RoomType";

/**
 * Generates a dungeon, given a space to fill and the size of the rooms to fill it with.
 */
export class DungeonGenerator {
    constructor(
        public dungeonSize: Point,
        public minRoomSize: Point,
        public maxRoomSize: Point,
        public minAspectRatio: number,
        public maxAspectRatio: number,
        public minRoomSpacing: number,
        public maxRoomSpacing: number,
        public roomCreateAttempts: number,
    ) { }

    generate(): ServerDungeon {
        //Dungeon generation happens here

        // Fill the dungeon with walls
        const dungeon = new ServerDungeon(this.dungeonSize);
        dungeon.tiles = Array.from({ length: this.dungeonSize.x }, () => {
            return Array.from({ length: this.dungeonSize.y }, () => {
                return { definition: TileName.wall, mods: [] };
            });
        });

        this.generateDungeonRooms(dungeon);

        this.provideRoomTypes(dungeon);

        this.connectRooms(dungeon);

        this.setSpawnPoints(dungeon);

        return dungeon;
    }

    setSpawnPoints(dungeon: ServerDungeon): void {
        dungeon.rooms.forEach((room) => {
            const numSpawns = random(1, room.maxSpawnTiles + 1);
            const bottomRight = room.rect.bottomRight;
            const openSpaces: Point[] = [];
            for(let x = room.rect.topLeft.x; x < bottomRight.x; x++) {
                for(let y = room.rect.topLeft.y; y < bottomRight.y; y++) {
                    const point = {x, y};
                    // check if the square is open
                    if (!dungeon.tileIsBlocked(point, [MovementType.land])) {
                        openSpaces.push(point);
                    }
                }
            }

            while(room.spawnTiles.length < numSpawns && openSpaces.length > 0) {
                const index = random(0, openSpaces.length);
                room.spawnTiles.push(openSpaces[index]);
                openSpaces.splice(index, 1);
            }
        });
    }

    provideRoomTypes(dungeon: ServerDungeon): void {
        // set it to the maximum age
        dungeon.rooms.forEach((room) => {
            const roomType = randomEnum(RoomType);
            room.type = roomType;
            RoomToTypeConverters[roomType](room, dungeon);
        });
    }

    generateDungeonRooms(dungeon: ServerDungeon): void {
        const possibleRooms: Room[] = [];

        for (let i = 0; i < this.roomCreateAttempts; i++) {
            if (dungeon.rooms.length === 0) {
                //generate the first room 
                const size = {
                    x: random(this.minRoomSize.x, this.maxRoomSize.x),
                    y: random(this.minRoomSize.y, this.maxRoomSize.y)
                };

                const location = {
                    x: random(1, this.dungeonSize.x - size.x),
                    y: random(1, this.dungeonSize.y - size.y)
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

                //generate the y size, then clamp the x size to the appropriate aspect ratio
                const ySize = random(this.minRoomSize.y, this.maxRoomSize.y)
                const minX = Math.max(ySize * this.minAspectRatio, this.minRoomSize.x);
                const maxX = Math.min(ySize * this.maxAspectRatio, this.maxRoomSize.x);
                const size = {
                    x: random(minX, maxX),
                    y: ySize
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
                    this.addRoomToDungeon(room, dungeon, startIndex);
                }
            }
        }
    }

    private addRoomToDungeon(room: Room, dungeon: ServerDungeon, startRoomIndex?: number): void {
        dungeon.rooms.push(room);
        const bottomRight = room.rect.bottomRight;
        for(let x = room.rect.location.x; x < bottomRight.x; x++) {
            for(let y = room.rect.location.y; y < bottomRight.y; y++) {
                dungeon.tiles[x][y].definition = undefined;
            }
        }

        if(startRoomIndex !== undefined) {
            const startRoom = dungeon.rooms[startRoomIndex];
            room.connections.push(startRoomIndex);
            startRoom.connections.push(dungeon.rooms.length - 1);
            dungeon.connections.push([dungeon.rooms.length - 1, startRoomIndex]);
        }
    }

    private connectRooms(dungeon: ServerDungeon): void {
        dungeon.connections.forEach((rooms) => {
            const room = dungeon.rooms[rooms[0]];
            const startRoom = dungeon.rooms[rooms[1]];

            // connect the points 
            const connections = this.getRoomConnections(startRoom, room);
            this.connectPoints(connections.start, connections.end, connections.direction, dungeon);

            // Connect the start to the center
            const startCenter = startRoom.rect.center;
            const startDirection = this.getPointToPointOnRoomDirection(startCenter, connections.start, room);
            this.connectPoints(startCenter, connections.start, startDirection, dungeon);

            // Connect the end to the center
            const endCenter = room.rect.center;
            const endDirection = this.getPointToPointOnRoomDirection(endCenter, connections.end, room);
            this.connectPoints(endCenter, connections.end, endDirection, dungeon);
        });
    }

    /**
     * Gets the direction to start going from a given point to a point that's on the edge of a room. 
     * The point will always need to make 1 turn if the correct start direction is chosen.
     * The exception is if the points are already lined up in 1 axis, in which case it won't need any turns 
     * ###X#####
     * #  ↑    #
     * #  ←←X  #
     * #       #
     * #########
     * 
     * ####X####
     * #   ↑   #
     * #   X   #
     * #       #
     * #########
     */
    private getPointToPointOnRoomDirection(point: Point, endPoint: Point, room: Room): Point {
        let x = 0;
        let y = 0;
        const br = room.rect.bottomRight;

        if ((point.y !== endPoint.y) && (endPoint.x === room.rect.topLeft.x || endPoint.x === br.x || point.x === endPoint.x)) {
            // The point needs to start by going in the y direction
            y = point.y < endPoint.y ? 1 : -1;
        } else {
            x = point.x < endPoint.x ? 1 : -1;
        }

        return {
            x, y
        };
    }

    /**
     * Gets the coordinates and starting direction for appropriate spots to connect a room between. 
     * One turn is always required, unless they're overlapping in one axis, in which case no turns are required.
     * This technique of only turning when there's no overlap will ensure that part of a room won't get cut off.
     * 
     * One good turn:
     * #########             
     * #       #             
     * #       #             
     * #       #             
     * #####X###    #########        
     *      ↓       #       #
     *      ↓       #       #
     *      ↓→→→→→→→X       #
     *              #########
     * 
     * Overlap, no turn required:
     * #########              
     * #       #              
     * #       #     #########        
     * #       X→→→→→X       #        
     * #########     #       #        
     *               #       #
     *               #########
     *           
     * When there are no overlaps, always picks a vertical:horizontal side pair, instead of vertical:vertical / horizontal:horizontal
     * Eliminates bad side connections:
     * #########             
     * #       #             
     * #       #             
     * #       #             
     * #####X###            
     *      ↓       
     *      ↓       
     *      ↓
     *      ↓→→→→→→→→→→X#####
     *              #       #
     *              #       #
     *              #       #
     *              #########
     */
    private getRoomConnections(startRoom: Room, endRoom: Room): { start: Point, end: Point, direction: Point } {
        // start - x / y
        // end - x / y
        // overlap
        let start: 'x' | 'y';
        let end: 'x' | 'y';

        const startBr = startRoom.rect.bottomRight;
        const startPoint = { x: 0, y: 0 };
        const endPoint = { x: 0, y: 0 };
        const nextDirection = { x: 0, y: 0 };
        const bottomRight = endRoom.rect.bottomRight;

        if(startBr.x >= endRoom.rect.topLeft.x && startRoom.rect.topLeft.x <= bottomRight.x) {
            //rooms overlap in the x
            start = end = 'y';
            const leftMost = startRoom.rect.topLeft.x < endRoom.rect.topLeft.x ? endRoom.rect.topLeft.x : startRoom.rect.topLeft.x;
            const rightMost = startBr.x < bottomRight.x ? startBr.x : bottomRight.x;
            startPoint.x = endPoint.x = random(leftMost, rightMost + 1);
        } else if(startBr.y >= endRoom.rect.topLeft.y && startRoom.rect.topLeft.y <= bottomRight.y) {
            //rooms overlap in the y
            start = end = 'x';
            const leftMost = startRoom.rect.topLeft.y < endRoom.rect.topLeft.y ? endRoom.rect.topLeft.y : startRoom.rect.topLeft.y;
            const rightMost = startBr.y < bottomRight.y ? startBr.y : bottomRight.y;
            startPoint.y = endPoint.y = random(leftMost, rightMost + 1);
        } else {
            if (Math.random() > 0.5) {
                start = 'x';
                end = 'y';
                startPoint.y = random(startRoom.rect.location.y + 1, bottomRight.y);
                endPoint.x = random(endRoom.rect.location.x + 1, bottomRight.x);
            }
            else {
                start = 'y';
                end = 'x';
                startPoint.x = random(startRoom.rect.location.x + 1, bottomRight.x);
                endPoint.y = random(endRoom.rect.location.y + 1, bottomRight.y);
            }
        }

        // Generate the start and points, somewhere on the perimeter of the room 
        if(start === 'x') {
            if (startRoom.rect.location.x < endRoom.rect.location.x) {
                startPoint.x = startBr.x;
                nextDirection.x = 1;
            } else {
                startPoint.x = startRoom.rect.location.x;
                nextDirection.x = -1;
            }
        } else {
            if (startRoom.rect.location.y < endRoom.rect.location.y) {
                startPoint.y = startBr.y;
                nextDirection.y = 1;
            } else {
                startPoint.y = startRoom.rect.location.y;
                nextDirection.y = -1;
            }
        }

        if (end === 'x') {
            if (startRoom.rect.location.x < endRoom.rect.location.x) {
                endPoint.x = endRoom.rect.location.x;
            } else {
                endPoint.x = bottomRight.x;
            }
        } else {
            if (startRoom.rect.location.y < endRoom.rect.location.y) {
                endPoint.y = endRoom.rect.location.y;
            } else {
                endPoint.y = bottomRight.y;
            }
        }

        return {
            direction: nextDirection,
            start: startPoint,
            end: endPoint
        };
    }

    private connectPoints(startPoint: Point, endPoint: Point, direction: Point, dungeon: ServerDungeon): void {
        let current = startPoint;
        while(current.x !== endPoint.x || current.y !== endPoint.y) {
            dungeon.tiles[current.x][current.y].definition = undefined;
            current = { x: current.x + direction.x, y: current.y + direction.y };

            if (direction.x !== 0 && current.x === endPoint.x) {
                direction.x = 0;
                direction.y = current.y < endPoint.y ? 1 : -1;
            } else if (direction.y !== 0 && current.y === endPoint.y) {
                direction.y = 0;
                direction.x = current.x < endPoint.x ? 1 : -1;
            }
        }
        dungeon.tiles[endPoint.x][endPoint.y].definition = undefined;
        dungeon.tiles[endPoint.x][endPoint.y].mods = [];
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
            //either on the left or right - x will be either 0 or max, y will be modulo of the diff
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
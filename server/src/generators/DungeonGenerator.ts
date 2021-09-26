import { Point } from "../../../common/src/types/Points";
import { random } from "../../../common/src/utils/MathUtils";
import { Condition, Room } from "../../../common/src/models/Room";
import { Rectangle } from "../../../common/src/models/Rectangle";
import { Dungeon } from "../../../common/src/models/Dungeon";

/**
 * Generates a dungeon, given a space to fill and the size of the rooms to fill it with.
 */
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
        //Dungeon generation happens here

        //generate the first room
        const dungeon = new Dungeon(this.dungeonSize);
        dungeon.tiles = new Array(this.dungeonSize.x);
        for (let i = 0; i < dungeon.tiles.length; i++) {
            dungeon.tiles[i] = (new Array(this.dungeonSize.y));
            for (let j = 0; j < dungeon.tiles[i].length; j++) {
                dungeon.tiles[i][j] = {coords: { x: i, y: j }, definition : 'wall', mods: []};
            }
        }

        this.generateDungeonRooms(dungeon);

        this.ageDungeon(dungeon);

        this.connectRooms(dungeon);

        this.setSpawnPoints(dungeon);

        return dungeon;

    }

    setSpawnPoints(dungeon: Dungeon): void {
        dungeon.rooms.forEach((room) => {
            const numSpawns = random(1, room.maxSpawnTiles + 1);
            if (room.age === 1) {
                for(let i = 0; i < numSpawns; i++) {
                    room.spawnTiles.push({x: random(room.rect.topLeft.x, room.rect.bottomRight.x), y: random(room.rect.topLeft.y, room.rect.bottomRight.y)});
                }
            } else {
                const bottomRight = room.rect.bottomRight;
                const openSpaces: Point[] = [];
                for(let x = room.rect.topLeft.x; x < bottomRight.x; x++) {
                    for(let y = room.rect.topLeft.y; y < bottomRight.y; y++) {
                        // check if the square is open
                        if (dungeon.tiles[x][y].definition === undefined) {
                            openSpaces.push({x, y});
                        }
                    }
                }

                while(room.spawnTiles.length < numSpawns && openSpaces.length > 0) {
                    const index = random(0, openSpaces.length);
                    room.spawnTiles.push(openSpaces[index]);
                    openSpaces.splice(index, 1);
                }
            }
        });
    }

    ageDungeon(dungeon: Dungeon): void {
        const roomsToAge = [dungeon.rooms[random(0, dungeon.rooms.length)]];

        // set it to the maximum age
        const checked: Record<string, boolean> = { 
            [roomsToAge[0].id()]: true
        }
        roomsToAge[0].age = 3;
        let index = 0;
        do {
            const startRoom = roomsToAge[index];
            startRoom.connections.forEach((roomIndex) => {
                const room = dungeon.rooms[roomIndex];
                const roomId = room.id();
                if(checked[roomId]) {
                    //aready aged this room, don't try again
                    return;
                }
                checked[roomId] = true;

                const ageDifference = random(-1, 2);
                room.age = Math.min(startRoom.age + ageDifference, 4) as Condition;
                 
                if(room.age > 1) {
                    roomsToAge.push(room);
                }
            });
            index++;
        } while(index < roomsToAge.length)

        const passes = 2;
        roomsToAge.forEach((room) => {
            // gives a range of 0% - 50% chance of changing a tile
            const factor = (room.age - 1) / 6;
            const bottomRight = room.rect.bottomRight;
            for(let x = room.rect.topLeft.x; x < bottomRight.x; x++) {
                for(let y = room.rect.topLeft.y; y < bottomRight.y; y++) {
                   if(Math.random() < factor) {
                        dungeon.tiles[x][y].definition = 'rubble';
                    }
                }
            }

            // perform the cellular automata
            if(room.age > 2) {
                for(let pass = 0; pass < passes; pass++) {
                    for(let x = room.rect.topLeft.x; x < bottomRight.x; x++) {
                        for(let y = room.rect.topLeft.y; y < bottomRight.y; y++) {
                            this.runCellularAutomata(x, y, dungeon);
                        }
                    }
                }
            }
        });
    }

    runCellularAutomata(x: number, y: number, dungeon: Dungeon): string | undefined {
        let neighborCount = 0;
        for(let newX = x - 1; newX <= x + 1; newX++) {
            for(let newY = y - 1; newY <= y + 1; newY++) {
                if (
                    (newX === x && newY === y) 
                    || dungeon.tiles[newX] === undefined
                    || dungeon.tiles[newX][newY] === undefined
                    || dungeon.tiles[newX][newY].definition === undefined
                ) {
                    continue;
                }
                neighborCount++;
            }
        }
        dungeon.tiles[x][y].definition = neighborCount > 4 ? 'rubble' : undefined;
        return dungeon.tiles[x][y].definition;
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
                    this.addRoomToDungeon(room, dungeon, startIndex);
                }
            }
        }
    }

    private addRoomToDungeon(room: Room, dungeon: Dungeon, startRoomIndex?: number): void {
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

    private connectRooms(dungeon: Dungeon): void {
        dungeon.connections.forEach((rooms) => {
            const room = dungeon.rooms[rooms[0]];
            const startRoom = dungeon.rooms[rooms[1]];
            // choose a random spot on the start room
            // 2 scenarios
            //   * rooms overlap in one dimension 
            //   * rooms have no overlap
            const startBr = startRoom.rect.bottomRight;
            const bottomRight = room.rect.bottomRight;
            let startPoint: Point;
            let endPoint: Point;
            const nextDirection: Point = {x: 0, y: 0};
            const roomCenter = {x: Math.floor(room.rect.center.x), y: Math.floor(room.rect.center.y)};
            const startCenter = {x: Math.floor(startRoom.rect.center.x), y: Math.floor(startRoom.rect.center.y)};
            if(room.age > 1) {
                endPoint = roomCenter;
            } else {
                endPoint = {x: 0, y: 0};
            }

            if(startRoom.age > 1) {
                startPoint = startCenter;
            } else {
                startPoint = {x: 0, y: 0};
            }

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
                startPoint.x = startPoint.x || random(startRoom.rect.location.x + 1, startBr.x - 1);
                endPoint.x = endPoint.x || random(room.rect.location.x + 1, bottomRight.x - 1); 
                if (startRoom.rect.location.y < room.rect.location.y) {
                    //bottom of the start room connects to top of the end room
                    startPoint.y = startPoint.y || startBr.y;
                    endPoint.y = endPoint.y || room.rect.location.y;
                    nextDirection.y = 1;
                } else {
                    //top of the start room connects to bottom of the end room
                    startPoint.y = startPoint.y || startRoom.rect.location.y;
                    endPoint.y = endPoint.y || bottomRight.y;
                    nextDirection.y = -1;
                }
            } else {
                startPoint.y = startPoint.y || random(startRoom.rect.location.y + 1, startBr.y - 1);
                endPoint.y = endPoint.y || random(room.rect.location.y + 1, bottomRight.y - 1);
                if (startRoom.rect.location.x < room.rect.location.x) {
                    //right of the start room connects to the left of the end room
                    startPoint.x = startPoint.x || startBr.x;
                    endPoint.x = endPoint.x || room.rect.location.x;
                    nextDirection.x = 1;
                } else {
                    //left of the start room connects to the right of the end room
                    startPoint.x = startPoint.x || startRoom.rect.location.x;
                    endPoint.x = endPoint.x || bottomRight.x;
                    nextDirection.x = -1;
                }
            }

            // connect them
            let newPoint = startPoint;
            while(newPoint.x !== endPoint.x || newPoint.y !== endPoint.y) {
                dungeon.tiles[newPoint.x][newPoint.y].definition = undefined;
                newPoint = {x: newPoint.x + nextDirection.x, y: newPoint.y + nextDirection.y}

                if(nextDirection.x !== 0 && newPoint.x === endPoint.x) {
                    nextDirection.x = 0;
                    nextDirection.y = newPoint.y < endPoint.y ? 1 : -1;
                } else if(nextDirection.y !== 0 && newPoint.y === endPoint.y) {
                    nextDirection.y = 0;
                    nextDirection.x = newPoint.x < endPoint.x ? 1 : -1;
                }
            }
            dungeon.tiles[endPoint.x][endPoint.y].definition = undefined;
        });
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
import { Point } from "../types/Points";
import { Spawnable } from "./Spawnable";
import { Condition } from "./Room";
import { BlockLayer } from "../types/TileDefinition";

export class Character implements Spawnable {
    spawns: Condition[] = [1];
    location: Point;
    constructor(public spriteName: string) {}

    getBlockLayer(): BlockLayer {
        return 'character';
    }
}
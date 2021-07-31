import { Point } from "../types/Points";
import { Character } from "./Character";

export class Player  {
    character: Character;
    location: Point;
    constructor(public id: string) {
        this.character = new Character('player');
    }
}
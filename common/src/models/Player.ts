import { Character } from "./Character";

export class Player  {
    character: Character;
    constructor(public id: string) {
        this.character = new Character('player');
    }
}
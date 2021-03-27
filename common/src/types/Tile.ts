import { TileDefinition } from "./TileDefinition";

export type Tile = {
    x: number,
    y: number,
    definition: TileDefinition;
    seen: boolean;
    visible: boolean;
}
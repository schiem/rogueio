import { Game } from "../../../common/src/models/Game";
import { Dungeon } from "../../../common/src/models/Dungeon";
import { SpriteSheet } from "../rendering/SpriteSheet";
import { Point } from "../../../common/src/types/Points";
import { Renderer } from "../rendering/Renderer";
import { ViewPort } from "../rendering/ViewPort";
import { LocationComponent } from "../../../common/src/components/LocationComponent";
import { TileDefinitions } from "../../../common/src/consts/TileDefinitions";
import { InitEvent } from "../../../common/src/events/server/InitEvent";
import { Sprite } from "../../../common/src/types/Sprite";
import { InputEventHandler } from "../events/InputEventHandler";

export class ClientGame extends Game {
    currentPlayerId: string;
    renderer: Renderer;
    inputEventHandler: InputEventHandler;
    timeInitialized: number;

    constructor(
        canvas: HTMLCanvasElement,
        spriteSheet: SpriteSheet,
        viewPort: ViewPort
    ) {
        super();
        this.renderer = new Renderer(canvas, spriteSheet, viewPort);
        this.inputEventHandler = new InputEventHandler(this);

        this.systems.location.locationAddedEmitter.subscribe((location) => {
            this.renderDungeonTileAtLocation(location);
            this.renderer.renderViewPort();
        });
        this.systems.location.locationRemovedEmitter.subscribe((location) => {
            this.renderDungeonTileAtLocation(location);
            this.renderer.renderViewPort();
        });

        this.systems.location.locationMovedEmitter.subscribe((data) => {
            if (data.id === this.players[this.currentPlayerId].characterId) {
                this.recenterViewPort();
            }
            this.renderer.renderViewPort();
        });
    }

    postDeserialize(event: InitEvent) {
        this.currentPlayerId = event.data.playerId;
        this.players = event.data.game.players;
        this.currentLevel = new Dungeon({x: 0, y: 0});
        this.currentLevel = Object.assign(this.currentLevel, event.data.game.currentLevel);
        this.timeInitialized = event.ts;
        
        // Get the current list of entities
        Object.assign(this.entityManager, event.data.game.entityManager);

        // deserialize all the systems
        this.systems.location = Object.assign(this.systems.location, event.data.game.systems.location);
        this.systems.location.postDeserialize();
    }

    renderDungeonTileAtLocation(point: Point): void {
        const dungeon = this.currentLevel;
        // render characters on top
        let sprite: Sprite | undefined;
        let highestComponent: LocationComponent | undefined;
        let tileDefName: string | undefined;

        // TODO - remove this once we have vision
        if (!dungeon.hasOpenTileAround(point)) {
            return;
        }
        
        if (highestComponent = this.systems.location.getHighestComponentAtLocation(point)) {
            // if there's something there, draw that
            sprite = highestComponent.sprite;
        } else if (tileDefName = dungeon.tiles[point.x][point.y]?.definition) {
            // draw the tile underneath
            sprite = TileDefinitions[tileDefName].sprite;
        } else {
            sprite = TileDefinitions['floor'].sprite;
        }

        this.renderer.drawSprite(sprite, point);
    }

    /**
     * Recenters the viewport on the current player
     * This should be done before the viewport is re-rendered
     */
    recenterViewPort(): void {
        const characterId = this.players[this.currentPlayerId].characterId;
        const characterLocation: LocationComponent = this.systems.location.getComponent(characterId);
        if (characterLocation) {
            this.renderer.centerViewPortOn(characterLocation.location);
        }
    }

    renderDungeon(dungeon: Dungeon): void {
        this.currentLevel = dungeon;
        for(let x = 0; x < this.currentLevel.tiles.length; x++) {
            for(let y = 0; y < this.currentLevel.tiles[x].length; y++) {
                this.renderDungeonTileAtLocation({x, y});
            }
        }
        this.recenterViewPort();
        this.renderer.renderViewPort();
    }
}
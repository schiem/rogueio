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
import { VisiblitySystem } from "../../../common/src/systems/VisibilitySystem";
import { SharedVisibilityComponent, VisiblityComponent } from "../../../common/src/components/VisibilityComponent";
import { spriteColors } from "../rendering/Sprites";

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
        this.systems.visibility = new VisiblitySystem(this.entityManager, this.systems.ally, this.systems.location, { x: this.dungeonX, y: this.dungeonY });

        this.renderer = new Renderer(canvas, spriteSheet, viewPort);
        this.inputEventHandler = new InputEventHandler(this);

        this.systems.location.componentUpdatedEmitter.subscribe((data) => {
            this.renderDungeonTileAtLocation(data.props.location);
            this.renderer.renderViewPort();
        });

        this.systems.location.locationRemovedEmitter.subscribe((data) => {
            this.renderDungeonTileAtLocation(data.location);
            this.renderer.renderViewPort();
        });

        this.systems.location.locationMovedEmitter.subscribe((data) => {
            if (data.id === this.players[this.currentPlayerId].characterId) {
                this.recenterViewPort();
            }
            this.renderer.renderViewPort();
        });

        this.systems.visibility.singleVisionPointChanged.subscribe((data) =>  {
            this.renderDungeonTileAtLocation(data);
            this.renderer.renderViewPort();
        });
    }

    postDeserialize(event: InitEvent) {
        this.currentPlayerId = event.data.playerId;
        this.players = event.data.game.players;
        this.currentLevel = new Dungeon({x: 0, y: 0});
        this.currentLevel = Object.assign(this.currentLevel, event.data.game.currentLevel);
        this.timeInitialized = event.ts;

        const systems = this.systems as any;
        const incomingSystems = event.data.game.systems as any;
        
        // Get the current list of entities
        Object.assign(this.entityManager, event.data.game.entityManager);

        // deserialize all the systems
        Object.keys(incomingSystems).forEach((system) => {
            Object.assign(systems[system], incomingSystems[system]);
            systems[system].postDeserialize();
        });
    }

    renderDungeonTileAtLocation(point: Point): void {
        const dungeon = this.currentLevel;
        // render characters on top
        let sprite: Sprite | undefined;

        // if the tile was never seen, then it should never render
        const playerId = this.currentPlayerId;
        const entityId = this.players[playerId].characterId;
        if (!this.systems.visibility.tileWasSeen(entityId, point)) {
            return;
        }

        const tile = dungeon.tiles[point.x][point.y];
        const isVisible = this.systems.visibility.sharedTileIsVisible(entityId, point);
        let colorOverride;
        if (!isVisible) {
            colorOverride = 'grey';
        }

        let highestComponent;
        if (isVisible && (highestComponent = this.systems.location.getHighestComponentAtLocation(point))) {
            // draw an entity that's on the location
            // but only if the tile is visible - TODO: Draw already seen items
            sprite = highestComponent.component.sprite;
        } else if (tile.definition) {
            // draw the tile underneath
            sprite = TileDefinitions[tile.definition].sprite;
        } else {
            // draw the default floor tile
            sprite = TileDefinitions['floor'].sprite;
        }

        this.renderer.drawSprite(sprite, point, colorOverride);
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
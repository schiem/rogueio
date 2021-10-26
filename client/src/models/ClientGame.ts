import { Game } from "../../../common/src/models/Game";
import { Dungeon } from "../../../common/src/models/Dungeon";
import { SpriteSheet } from "../rendering/SpriteSheet";
import { Point } from "../../../common/src/types/Points";
import { Renderer } from "../rendering/Renderer";
import { ViewPort } from "../rendering/ViewPort";
import { LocationComponent } from "../../../common/src/components/LocationComponent";
import { TileDefinitions } from "../../../common/src/consts/TileDefinitions";
import { InitEvent } from "../../../common/src/events/server/InitEvent";
import { Sprite, SpriteColor } from "../../../common/src/types/Sprite";
import { InputEventHandler } from "../events/InputEventHandler";
import { VisibilitySystem } from "../../../common/src/systems/VisibilitySystem";
import { setupUI } from "../UI/UI";
import { TileName } from "../../../common/src/types/Tile";
import { ComponentSystem } from "../../../common/src/systems/ComponentSystem";

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
        this.systems.visibility = new VisibilitySystem(this.entityManager, this.systems.ally, this.systems.location, { x: this.dungeonX, y: this.dungeonY });

        this.renderer = new Renderer(canvas, spriteSheet, viewPort);
        this.inputEventHandler = new InputEventHandler(this);

        this.systems.location.removedComponentEmitter.subscribe((data) => {
            this.renderDungeonTileAtLocation(data.component.location);
            this.renderer.renderViewPort();
        });

        this.systems.location.addedComponentEmitter.subscribe((data) => {
            this.renderDungeonTileAtLocation(data.component.location);
            this.renderer.renderViewPort();
        });

        this.systems.location.componentUpdatedEmitter.subscribe((data) => {
            if (data.props.location) {
                if (data.id === this.players[this.currentPlayerId].characterId) {
                    this.recenterViewPort();
                }

                this.renderDungeonTileAtLocation(data.props.location);
                this.renderDungeonTileAtLocation(data.oldProps.location);
                this.renderer.renderViewPort();
            }
        });

        this.systems.visibility.singleVisionPointChanged.subscribe((data) =>  {
            if (data.tile) {
                this.currentLevel.setTile(data.tile);
            }
            this.renderDungeonTileAtLocation(data.point);
            this.renderer.renderViewPort();
        });
    }

    postDeserialize(event: InitEvent) {
        this.currentPlayerId = event.data.playerId;
        this.players = event.data.gameData.players;
        this.currentLevel = new Dungeon({x: 0, y: 0});
        event.data.gameData.tiles?.forEach((tile) => {
            this.currentLevel.setTile(tile);
        });
        this.timeInitialized = event.ts;

        const systems = this.systems as Record<string, ComponentSystem<unknown>>;

        // Add additional data to the systems first
        for(const systemName in event.data.gameData.additionalSystemData) {
            Object.assign(systems[systemName], event.data.gameData.additionalSystemData[systemName]);
        }

        // Get the set of entities + components
        const entities = event.data.gameData.entities;
        for(const key in entities) {
            const entityId = parseInt(key);
            this.entityManager.addEntity(entityId);
            // Add all the components.
            this.addComponentsForEntity(entityId, entities[entityId]);
        }

        // Initialize the UI
        setupUI(this.systems, this.players[this.currentPlayerId]);
    }

    addComponentsForEntity(entityId: number, components: Record<string, any>): void {
        const systems = this.systems as Record<string, ComponentSystem<unknown>>;
        for(const systemName in components) {
            const component = components[systemName];
            
            // Add it directly, do not fire events
            systems[systemName].addComponentForEntity(entityId, component);
        }
    }

    renderDungeonTileAtLocation(point: Point): void {
        const dungeon = this.currentLevel;
        let sprite: Sprite | undefined;

        // if the tile was never seen, then it should never render
        const playerId = this.currentPlayerId;
        const entityId = this.players[playerId].characterId;
        if (!this.systems.visibility.tileWasSeen(entityId, point)) {
            return;
        }

        const def = dungeon.getVisibleTileDefinition(point);

        const isVisible = this.systems.visibility.sharedTileIsVisible(entityId, point);
        let colorOverride;
        if (!isVisible) {
            colorOverride = SpriteColor.grey;
        }

        let highestComponent;
        if (isVisible && (highestComponent = this.systems.location.getHighestComponentAtLocation(point))) {
            // draw an entity that's on the location
            // but only if the tile is visible - TODO: Draw already seen items
            sprite = highestComponent.component.sprite;
        } else if (def) {
            sprite = def.sprite;
        } else {
            // draw the default wall tile
            sprite = TileDefinitions[TileName.wall].sprite;
        }

        this.renderer.drawSprite(sprite, point, colorOverride);
    }

    /**
     * Recenters the viewport on the current player
     * This should be done before the viewport is re-rendered
     */
    recenterViewPort(): void {
        const characterId = this.players[this.currentPlayerId].characterId;
        const characterLocation = this.systems.location.getComponent(characterId);
        if (characterLocation) {
            this.renderer.centerViewPortOn(characterLocation.location);
        }
    }

    renderDungeon(dungeon: Dungeon): void {
        this.currentLevel = dungeon;
        for(let x = 0; x < this.currentLevel.tiles.length; x++) {
            if (!this.currentLevel.tiles[x]) {
                continue;
            }
            for(let y = 0; y < this.currentLevel.tiles[x].length; y++) {
                this.renderDungeonTileAtLocation({x, y});
            }
        }
        this.recenterViewPort();
        this.renderer.renderViewPort();
    }
}
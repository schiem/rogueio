import { Game, GameSystems } from "../../../common/src/models/Game";
import { Dungeon } from "../../../common/src/models/Dungeon";
import { SpriteSheet } from "../rendering/SpriteSheet";
import { Point, pointDistanceSquared, pointsAreEqual } from "../../../common/src/types/Points";
import { Renderer } from "../rendering/Renderer";
import { ViewPort } from "../rendering/ViewPort";
import { TileDefinitions } from "../../../common/src/consts/TileDefinitions";
import { InitEvent } from "../../../common/src/events/server/InitEvent";
import { Sprite, SpriteColor } from "../../../common/src/types/Sprite";
import { InputEventHandler } from "../events/InputEventHandler";
import { VisibilitySystem } from "../../../common/src/systems/VisibilitySystem";
import { setupUI } from "../UI/UI";
import { TileName } from "../../../common/src/types/Tile";
import { ComponentSystem } from "../../../common/src/systems/ComponentSystem";
import { EventEmitter } from "../../../common/src/events/EventEmitter";
import { MessageData } from "../../../common/src/events/server/MessageEvent";
import { ActionSystem } from "../../../common/src/systems/ActionSystem";
import { ClientLocationSystem } from "../systems/ClientLocationSystem";
import { ClientHealthSystem } from "../systems/ClientHealthSystem";
import { ClientVisibilitySystem } from "../systems/ClientVisibilitySystem";
import { ClientDescriptionSystem } from "../systems/ClientDescriptionSystem";
import { LocationComponent } from "../../../common/src/components/LocationComponent";

export type ClientGameSystems = GameSystems & {
    location: ClientLocationSystem;
    visibility: ClientVisibilitySystem;
    description: ClientDescriptionSystem,
    health: ClientHealthSystem;
};

export class ClientGame extends Game {
    systems: ClientGameSystems;
    currentPlayerId: string;
    renderer: Renderer;
    inputEventHandler: InputEventHandler;
    timeInitialized: number;
    messageEmitter = new EventEmitter<MessageData>();
    focusMaybeChangedEmitter = new EventEmitter<number | Point | undefined>();

    currentFocus?: number | Point;

    constructor(
        canvas: HTMLCanvasElement,
        spriteSheet: SpriteSheet,
        viewPort: ViewPort
    ) {
        super();
        this.constructSystems();

        this.renderer = new Renderer(canvas, spriteSheet, viewPort);
        this.inputEventHandler = new InputEventHandler(this, viewPort.canvas);

        this.systems.location.removedComponentEmitter.subscribe((data) => {
            this.renderDungeonTileAtLocation(data.component.location);
            this.renderer.renderViewPort();

            if (this.currentFocus !== undefined) {
                const focusPoint = this.normalizeFocus(this.currentFocus);
                if (focusPoint) {
                    if (pointsAreEqual(focusPoint, data.component.location)) {
                        this.focusMaybeChangedEmitter.emit(this.currentFocus);
                    }
                }
            }
        });

        this.systems.location.addedComponentEmitter.subscribe((data) => {
            this.renderDungeonTileAtLocation(data.component.location);
            this.renderer.renderViewPort();

            if (this.currentFocus !== undefined) {
                const focusPoint = this.normalizeFocus(this.currentFocus);
                if (focusPoint) {
                    if (pointsAreEqual(focusPoint, data.component.location)) {
                        this.focusMaybeChangedEmitter.emit(this.currentFocus);
                    }
                }
            }
        });

        this.systems.location.componentUpdatedEmitter.subscribe((data) => {
            if (data.props.location) {
                if (data.id === this.players[this.currentPlayerId].characterId) {
                    this.recenterViewPort();
                }

                const newLocation = data.props.location as Point;
                const oldLocation = data.oldProps.location as Point;

                this.renderDungeonTileAtLocation(newLocation);
                this.renderDungeonTileAtLocation(oldLocation);
                this.renderer.renderViewPort();

                if (this.currentFocus !== undefined) {
                    const focusPoint = this.normalizeFocus(this.currentFocus);
                    if (focusPoint) {
                        if (pointsAreEqual(focusPoint, newLocation) || pointsAreEqual(focusPoint, oldLocation)) {
                            this.focusMaybeChangedEmitter.emit(this.currentFocus);
                        }
                    }
                }
            }
        });

        this.systems.visibility.visionPointsChanged.subscribe((data) =>  {
            data.forEach((pointData) => {
                if (pointData.tile) {
                    this.currentLevel.setTile(pointData.tile);
                }
                this.renderDungeonTileAtLocation(pointData.point);
            });
            this.renderer.renderViewPort();
        });
    }

    constructSystems(): void {
        this.systems.description = new ClientDescriptionSystem(this.entityManager);
        this.systems.health = new ClientHealthSystem(this.entityManager, this.systems.description, this);
        this.systems.location = new ClientLocationSystem(this.entityManager, { x: this.dungeonX, y: this.dungeonY });

        // Construct the common systems
        super.constructSystems();

        this.systems.visibility = new ClientVisibilitySystem(this.entityManager, this.systems.ally, this.systems.location, this.systems.health, { x: this.dungeonX, y: this.dungeonY }, this.systems.inventory);
        this.systems.action = new ActionSystem(this.entityManager);
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
        setupUI(this, this.players[this.currentPlayerId]);
    }

    findClosestEntity(): number | undefined {
        const characterId = this.players[this.currentPlayerId].characterId;
        const characterLocation = this.systems.location.getComponent(characterId);
        if (!characterLocation) {
            return;
        }

        const components = this.systems.ally.getAlliesForGroup('enemies');
        let bestLengthSqr: number | undefined = undefined;
        let closestEntity: number | undefined;  
        components.forEach((id) => {
            const locationComponent = this.systems.location.getComponent(id);

            if (locationComponent === undefined) {
                return;
            }
            const distanceSquared = pointDistanceSquared(locationComponent.location, characterLocation.location);
            if (bestLengthSqr === undefined || distanceSquared < bestLengthSqr) {
                closestEntity = id;
                bestLengthSqr = distanceSquared;
            }
        });

        return closestEntity === undefined ? closestEntity : closestEntity;
    }

    findNextEntity(): number | undefined {
        let currentLocation: LocationComponent | undefined;
        if (typeof this.currentFocus !== 'number' || (currentLocation = this.systems.location.getComponent(this.currentFocus)) === undefined) {
            return this.findClosestEntity();
        }

        const sortedComponents = this.getSortedEnemyList();
        if (sortedComponents.length === 0) {
            return;
        }


        const currentIndex = sortedComponents.findIndex((componentId) => componentId === this.currentFocus);
        if (currentIndex === sortedComponents.length - 1) {
            return sortedComponents[0];
        } else {
            return sortedComponents[currentIndex + 1];
        }
    }

    findPreviousEntity(): number | undefined {
        let currentLocation: LocationComponent | undefined;
        if (typeof this.currentFocus !== 'number' || (currentLocation = this.systems.location.getComponent(this.currentFocus)) === undefined) {
            return this.findClosestEntity();
        }

        const sortedComponents = this.getSortedEnemyList();
        if (sortedComponents.length === 0) {
            return;
        }


        const currentIndex = sortedComponents.findIndex((componentId) => componentId === this.currentFocus);
        if (currentIndex === 0) {
            return sortedComponents[sortedComponents.length - 1];
        } else {
            return sortedComponents[currentIndex - 1];
        }
    }

    getSortedEnemyList(): number[] {
        const characterId = this.players[this.currentPlayerId].characterId;
        const characterLocation = this.systems.location.getComponent(characterId);
        if (characterLocation === undefined) {
            return [];
        }

        const components = this.systems.ally.getAlliesForGroup('enemies');
        const componentIds: number[] = [];
        components.forEach((componentId) => {
            const locationComponent = this.systems.location.getComponent(componentId);
            if (locationComponent !== undefined) {
                componentIds.push(componentId);
            }
        });
        return componentIds.sort((a, b) => {
            const aLocation = this.systems.location.getComponent(a);
            const bLocation = this.systems.location.getComponent(b);
            if (aLocation === undefined || bLocation === undefined) {
                return 0;
            }
            return pointDistanceSquared(aLocation.location, characterLocation.location) - pointDistanceSquared(bLocation.location, characterLocation.location);
        });
    }

    changeFocus(target: number | Point): void {
        const newFocus = this.normalizeFocus(target);
        if (!newFocus) {
            return;
        }

        let oldFocus;
        if (this.currentFocus !== undefined) {
            oldFocus = this.normalizeFocus(this.currentFocus);
        }

        this.currentFocus = target;
        if (oldFocus !== undefined) {
            this.renderDungeonTileAtLocation(oldFocus);
        }
        this.renderDungeonTileAtLocation(newFocus);
        this.renderer.renderViewPort();
        this.focusMaybeChangedEmitter.emit(this.currentFocus);
    }

    addComponentsForEntity(entityId: number, components: Record<string, unknown>): void {
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
        let drawOutline = false;
        if(this.currentFocus !== undefined) {
            const normalizedFocus = this.normalizeFocus(this.currentFocus);
            drawOutline = normalizedFocus === undefined ? false : pointsAreEqual(normalizedFocus, point);
        }

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
        if (drawOutline) {
            this.renderer.outlineTile(point);
        }
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

    private normalizeFocus(target: Point | number): Point | undefined {
        if (typeof target === 'number') {
            return this.systems.location.getComponent(target)?.location;
        } else {
            return target;
        }
    }
}
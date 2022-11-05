import { Component } from "preact";
import { EventEmitter } from "../../../../common/src/events/EventEmitter";
import { Dungeon } from "../../../../common/src/models/Dungeon";
import { LocationSystem } from "../../../../common/src/systems/LocationSystem";
import { Point } from "../../../../common/src/types/Points";
import { localize } from "../../lang/Lang";
import { ClientDescriptionSystem } from "../../systems/ClientDescriptionSystem";

type FocusState = {
    tileDescription: string,
    entityDescription: string,
    entityNames: Record<number, string>
};

type FocusProps = {
    focusChangedEmitter: EventEmitter<number | Point | undefined>;
    changeFocusToEntity: (entityId: number) => void;
    descriptionSystem: ClientDescriptionSystem;
    locationSystem: LocationSystem;
    dungeon: Dungeon;
};

export class UIDescription extends Component<FocusProps, FocusState> {
    changeFocusToEntity: (entityId: number) => void;
    focusChangedEmitter: EventEmitter<number | Point | undefined>;
    subscription?: number;
    descriptionSystem: ClientDescriptionSystem;
    locationSystem: LocationSystem;
    dungeon: Dungeon;

    constructor({ focusChangedEmitter, changeFocusToEntity, descriptionSystem, locationSystem, dungeon }: FocusProps) {
        super();

        this.changeFocusToEntity = changeFocusToEntity;
        this.focusChangedEmitter = focusChangedEmitter;
        this.descriptionSystem = descriptionSystem;
        this.locationSystem = locationSystem;
        this.dungeon = dungeon;

        this.updateState;
    }

    componentDidMount(): void {
        this.subscription = this.focusChangedEmitter.subscribe((data) => {
            this.updateState(data);
        });
    }

    componentWillUnmount(): void {
        const subscription = this.subscription;
        if (subscription) {
            this.focusChangedEmitter.unsubscribe(subscription);
            this.subscription = undefined;
        }
    }

    updateState(newFocus: number | Point | undefined): void {
        const newState: FocusState = {
            tileDescription: '',
            entityDescription: '',
            entityNames: {}
        };

        let focusedEntity: number | undefined;
        let focusedPoint: Point | undefined;
        let otherEntities: number[] | undefined;
        const promises: Promise<unknown>[] = [];
        if (typeof newFocus === 'object') {
            focusedEntity = this.locationSystem.getHighestComponentAtLocation(newFocus)?.id;
            otherEntities = this.locationSystem.getEntitiesAtLocation(newFocus);
            focusedPoint = newFocus;
        } else if (typeof newFocus === 'number') {
            focusedEntity = newFocus;
            focusedPoint = this.locationSystem.getComponent(newFocus)?.location;
            if (focusedPoint) {
                otherEntities = this.locationSystem.getEntitiesAtLocation(focusedPoint);
            }
        }

        if (focusedEntity !== undefined) {
            promises.push(this.descriptionSystem.getLocalizedDescription(focusedEntity).then((description) => {
                newState.entityDescription = description;
            }));
        }

        if (focusedPoint!== undefined) {
            const definition = this.dungeon.getVisibleTileDefinition(focusedPoint);
            if (definition) {
                promises.push(localize(`common/tiles/${definition.name}`).then((description) => {
                    newState.tileDescription =  description;
                }));
            }
        }

        if (otherEntities !== undefined) {
            otherEntities.forEach((entityId) => {
                promises.push(this.descriptionSystem.getLocalizedName(entityId).then((name) => {
                    newState.entityNames[entityId] = name;
                }));
            });
        }

        Promise.all(promises).then(() => {
            this.setState(newState);
        });
    }

    render() {
        return <div id="focus">
          <div class="terminal">
            <div class="terminal-title">Focus</div>
            <div class="terminal-content">
                <div class="tile-description">{ this.state.tileDescription }</div>
                <div class="entities">
                    <ul class="entity-picker">
                        { this.state.entityNames && Object.keys(this.state.entityNames).map(entityId => 
                            <li class="separated-row">
                                <button onClick={() => { this.changeFocusToEntity(parseInt(entityId)) }}>{ this.state.entityNames[entityId as any] }</button>
                            </li>
                        )}
                    </ul>
                    <div class="entity-description">
                        { this.state.entityDescription }
                    </div>
                </div>
            </div>
          </div>
        </div>
    }
}
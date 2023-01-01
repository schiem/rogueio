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
    subscription?: number;

    constructor() {
        super();
    }

    componentDidMount(): void {
        this.subscription = this.props.focusChangedEmitter.subscribe((data) => {
            this.updateState(data);
        });

        this.updateState;
    }

    componentWillUnmount(): void {
        const subscription = this.subscription;
        if (subscription) {
            this.props.focusChangedEmitter.unsubscribe(subscription);
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
            focusedEntity = this.props.locationSystem.getHighestComponentAtLocation(newFocus)?.id;
            otherEntities = this.props.locationSystem.getEntitiesAtLocation(newFocus);
            focusedPoint = newFocus;
        } else if (typeof newFocus === 'number') {
            focusedEntity = newFocus;
            focusedPoint = this.props.locationSystem.getComponent(newFocus)?.location;
            if (focusedPoint) {
                otherEntities = this.props.locationSystem.getEntitiesAtLocation(focusedPoint);
            }
        }

        if (focusedEntity !== undefined) {
            promises.push(this.props.descriptionSystem.getLocalizedDescription(focusedEntity).then((description) => {
                newState.entityDescription = description;
            }));
        }

        if (focusedPoint !== undefined) {
            const definition = this.props.dungeon.getVisibleTileDefinition(focusedPoint);
            if (definition) {
                promises.push(localize(`common/tiles/${definition.name}`).then((description) => {
                    newState.tileDescription =  description;
                }));
            }
        }

        if (otherEntities !== undefined) {
            otherEntities.forEach((entityId) => {
                promises.push(this.props.descriptionSystem.getLocalizedName(entityId).then((name) => {
                    newState.entityNames[entityId] = name;
                }));
            });
        }
        
        Promise.all(promises).then(() => {
            this.setState(newState);
        });
    }

    render() {
        return <div id="focus" class="ui-block">
            <div class="terminal">
                <div class="terminal-title">Focus</div>
                <div class="terminal-content">
                    <div class="tile-description">{this.state.tileDescription}</div>
                    <div class="entities">
                        <ul class="entity-picker">
                            {this.state.entityNames && Object.keys(this.state.entityNames).map(entityId =>
                                <li class="separated-row">
                                    <button onClick={() => { this.props.changeFocusToEntity(parseInt(entityId)) }}>{this.state.entityNames[entityId as unknown as number]}</button>
                                </li>
                            )}
                        </ul>
                        <div class="entity-description">
                            {this.state.entityDescription}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }
}
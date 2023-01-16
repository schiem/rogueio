import { Component, Fragment } from "preact";
import { EventEmitter } from "../../../../common/src/events/EventEmitter";
import { Dungeon } from "../../../../common/src/models/Dungeon";
import { LocationSystem } from "../../../../common/src/systems/LocationSystem";
import { Point } from "../../../../common/src/types/Points";
import { localize } from "../../lang/Lang";
import { ClientDescriptionSystem } from "../../systems/ClientDescriptionSystem";
import { Glyphs } from "../Glyphs";

type FocusState = {
    tileDescription?: string,
    entityDescription?: string,
    entityName?: string,
    entityNames?: Record<number, string>
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
    labels = {
        tileDescription: localize('focus/floor'),
        entityDescription: localize('focus/currentFocus'),
        otherEntities: localize('focus/others'),
        nothingFocused: localize('focus/nothingFocused') ,
        focus: localize('action/focus')
    }

    constructor() {
        super();
        this.state = {};
    }

    componentDidMount(): void {
        this.subscription = this.props.focusChangedEmitter.subscribe((data) => {
            this.updateState(data);
        });
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
            tileDescription: undefined,
            entityNames: undefined,
            entityDescription: undefined,
            entityName: undefined
        };

        let focusedEntity: number | undefined;
        let focusedPoint: Point | undefined;
        let otherEntities: number[] | undefined;
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
            newState.entityDescription = this.props.descriptionSystem.getLocalizedDescription(focusedEntity);
            newState.entityName = this.props.descriptionSystem.getLocalizedName(focusedEntity);
        }

        if (focusedPoint !== undefined) {
            const definition = this.props.dungeon.getVisibleTileDefinition(focusedPoint);
            if (definition) {
                newState.tileDescription = localize(`tiles/${definition.name}`);
            }
        }

        if (otherEntities !== undefined) {
            newState.entityNames = {};
            otherEntities.forEach((entityId) => {
                if (entityId !== focusedEntity) {
                    (newState.entityNames as Record<number, string>)[entityId] = this.props.descriptionSystem.getLocalizedName(entityId);
                }
            });
        }
        
        this.setState(newState);
    }

    render() {
        return <Fragment>
            { (!this.state.tileDescription && !this.state.entityDescription) && <p>{this.labels.nothingFocused}</p> }

            {this.state.tileDescription && 
                <div class="tile-description separated-row">
                    <p>
                        <b>{this.labels.tileDescription}:</b><br/>
                        {this.state.tileDescription}
                    </p>
                </div> 
            }

            { this.state.entityDescription &&
                <div class="entity-description separated-row">
                    <p>
                        <b>{this.labels.entityDescription}:</b> { this.state.entityName }<br/>
                        {this.state.entityDescription}
                    </p>
                </div>
            }

            {(this.state.entityNames && !!Object.keys(this.state.entityNames).length) && 
                <div class="entities separated-row">
                    <p>
                        <b>{this.labels.otherEntities}:</b>
                    </p>
                    <ul class="entity-picker">
                        {Object.keys(this.state.entityNames).map(entityId =>
                            <li class="separated-row">
                                <button class="icon" title={ this.labels.focus } onClick={() => { this.props.changeFocusToEntity(parseInt(entityId)) }}>{ Glyphs.focus }</button> 
                                <span>{(this.state.entityNames as Record<number, string>)[entityId as unknown as number]}</span>
                            </li>
                        )}
                    </ul>
                </div>
            }
        </Fragment>
    }
}
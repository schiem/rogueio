import { Component, ComponentChild, Fragment } from "preact"
import { InventoryComponent } from "../../../../common/src/components/InventoryComponent";
import { DropEvent } from "../../../../common/src/events/client/DropEvent";
import { DescriptionSystem } from "../../../../common/src/systems/DescriptionSystem"
import { InventorySystem } from "../../../../common/src/systems/InventorySystem";
import { NetworkEventHandler } from "../../events/NetworkEventHandler";
import { localize } from "../../lang/Lang";
import { ClientDescriptionSystem } from "../../systems/ClientDescriptionSystem";
import { Glyphs } from "../Glyphs";

export type InventoryProps = {
    descriptionSystem: ClientDescriptionSystem;
    inventorySystem: InventorySystem;
    playerId: number;
}

export type InventoryState = {
    items: { name: string, weight: number, id: number }[]
}

export class UIInventory extends Component<InventoryProps, InventoryState> {
    labels = {
        emptyInventory: localize('inventory/empty'),
        drop: localize('action/drop'),
    };

    componentDidMount(): void {
        this.props.inventorySystem.componentUpdatedEmitter.subscribe((data) => {
            if (data.id !== this.props.playerId) {
                return;
            }

            const component = this.props.inventorySystem.getComponent(data.id);
            if (!component) {
                return;
            }

            this.updateState(component);
        });

        const component = this.props.inventorySystem.getComponent(this.props.playerId);
        if (component) {
            this.updateState(component);
        }
    }

    updateState(component: InventoryComponent): void {
        const items: { name: string, weight: number, id: number }[] = component.items.map(item => {
            return {
                name: this.props.descriptionSystem.getLocalizedName(item.id),
                weight: item.weight,
                id: item.id
            }
        });
        this.setState({
            items
        });
    }

    dropItem(index: number): void {
        NetworkEventHandler.sendEvent(new DropEvent(index));
    }

    render(): ComponentChild {
        return <Fragment>
            {this.state.items?.length ? 
                <table>
                    {this.state.items.map((item) =>
                        <tr>
                            <td class="collapse">
                                <button class="icon" onClick={() => this.dropItem(item.id)} title={this.labels.drop}>{Glyphs.drop}</button>
                            </td>
                            <td class="grow">
                                {item.name}
                            </td>
                            <td>{item.weight.toFixed(1)}</td>
                        </tr>
                    )}
                </table> : 
                <p>{ this.labels.emptyInventory }</p>
            }
        </Fragment>
    }
}
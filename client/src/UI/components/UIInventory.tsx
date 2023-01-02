import { Component, ComponentChild } from "preact"
import { InventoryComponent } from "../../../../common/src/components/InventoryComponent";
import { DescriptionSystem } from "../../../../common/src/systems/DescriptionSystem"
import { InventorySystem } from "../../../../common/src/systems/InventorySystem";
import { localize } from "../../lang/Lang";
import { ClientDescriptionSystem } from "../../systems/ClientDescriptionSystem";

export type InventoryProps = {
    descriptionSystem: ClientDescriptionSystem;
    inventorySystem: InventorySystem;
    playerId: number;
}

export type InventoryState = {
    items: { name: string, weight: number }[]
}

export class UIInventory extends Component<InventoryProps, InventoryState> {
    labels = {
        emptyInventory: localize('inventory/empty')
    }
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
        const items: { name: string, weight: number}[] = component.items.map(item => {
            return {
                name: this.props.descriptionSystem.getLocalizedName(item.id),
                weight: item.weight

            }
        });
        this.setState({
            items
        });
    }

    render(): ComponentChild {
        return <div id="inventory" class="ui-block">
            <div class="terminal">
                <div class="terminal-title">Inventory</div>
                <div class="terminal-content">
                    {   this.state.items?.length ? 
                        <ul>
                            {this.state.items.map((item) =>
                                <li class="columned"><span>{item.name}</span><span>{item.weight.toFixed(1)}</span></li>
                            )}
                        </ul> : 
                        <p>{ this.labels.emptyInventory }</p>
                    }
                </div>
            </div>
        </div>
    }
}
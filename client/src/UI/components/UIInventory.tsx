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
    private allNamesFetchedPromise?: Promise<unknown>;

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
        const items: { name: string, weight: number}[] = new Array(component.items.length);
        const promises: Promise<void>[] = [];

        for (let i = 0; i < component.items.length; i++) {
            promises.push(this.props.descriptionSystem.getLocalizedName(component.items[i].id).then((name) => {
                items[i] = {
                    name,
                    weight: component.items[i].weight
                }
            }));
        }

        const finishedPromise = Promise.all(promises).then(() => {
            if (finishedPromise === this.allNamesFetchedPromise) {
                this.setState({
                    items
                });
                this.allNamesFetchedPromise = undefined;
            }
        });

        this.allNamesFetchedPromise = finishedPromise;
    }

    render(): ComponentChild {
        return <div id="inventory" class="ui-block">
            <div class="terminal">
                <div class="terminal-title">Inventory</div>
                <div class="terminal-content">
                    <ul>
                        {this.state.items?.map((item) =>
                            <li class="columned"><span>{item.name}</span><span>{item.weight.toFixed(1)}</span></li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    }
}
import { Component, ComponentChild, Fragment } from "preact"
import { InventoryComponent } from "../../../../common/src/components/InventoryComponent";
import { DropEvent } from "../../../../common/src/events/client/DropEvent";
import { DescriptionSystem } from "../../../../common/src/systems/DescriptionSystem"
import { InventorySystem } from "../../../../common/src/systems/InventorySystem";
import { NetworkEventHandler } from "../../events/NetworkEventHandler";
import { localize } from "../../lang/Lang";
import { ClientDescriptionSystem } from "../../systems/ClientDescriptionSystem";
import { EquippableSystem } from "../../../../common/src/systems/EquippableSystem";
import { ConsumableSystem } from "../../../../common/src/systems/ConsumableSystem";
import { ConsumableCategory } from "../../../../common/src/components/ConsumableComponent";
import { EquipEvent } from "../../../../common/src/events/client/EquipEvent";
import { ConsumeEvent } from "../../../../common/src/events/client/ConsumeEvent";

export type InventoryProps = {
    descriptionSystem: ClientDescriptionSystem;
    inventorySystem: InventorySystem;
    equippableSystem: EquippableSystem;
    consumableSystem: ConsumableSystem;
    playerId: number;
}

export type InventoryState = {
    items: { name: string, id: number }[]
}

export class UIInventory extends Component<InventoryProps, InventoryState> {
    labels = {
        emptyInventory: localize('inventory/empty'),
        drop: localize('action/drop'),
        drink: localize('action/drink'),
        read: localize('action/read'),
        equip: localize('action/equip')
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

        this.props.consumableSystem.removedComponentEmitter.subscribe((data) => {
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
        const items: { name: string, id: number }[] = component.items.map(item => {
            return {
                name: this.props.descriptionSystem.getLocalizedName(item),
                id: item
            }
        });
        this.setState({
            items
        });
    }

    dropItem(id: number): void {
        NetworkEventHandler.sendEvent(new DropEvent(id));
    }

    equipItem(id: number): void {
        const component = this.props.equippableSystem.getComponent(id);
        if (!component) {
            return;
        }

        // TODO - if there's more than one slot, let them choose
        NetworkEventHandler.sendEvent(new EquipEvent(id, component.slots[0]));
    }

    consumeItem(id: number): void {
        NetworkEventHandler.sendEvent(new ConsumeEvent(id));
    }

    render(): ComponentChild {
        return <Fragment>
            {this.state.items?.length ? 
                <table>
                    {this.state.items.map((item) => {
                        const consumableComponent = this.props.consumableSystem.getComponent(item.id);
                        const equippableComponent = this.props.equippableSystem.getComponent(item.id);
                        return (<tr>
                            <td class="collapse">
                                <button type="button" class="icon-only" onClick={() => this.dropItem(item.id)} title={this.labels.drop}><i class='icon curve-arrow'></i></button>
                                { consumableComponent && 
                                    <button type="button" 
                                        class="icon-only" 
                                        onClick={() => this.consumeItem(item.id)} 
                                        title={consumableComponent.category === ConsumableCategory.potion ? this.labels.drink : this.labels.read}>
                                        <i class={'icon ' + (consumableComponent.category === ConsumableCategory.potion ? 'potion' : 'scroll')}></i>
                                    </button> 
                                }
                                { equippableComponent && <button type="button" class="icon-only" onClick={() => this.equipItem(item.id)} title={this.labels.equip}><i class='icon arrow-right'></i></button> }
                            </td>
                            <td class="grow">
                                {item.name}
                            </td>
                        </tr>)

                    })}
                </table> : 
                <p>{ this.labels.emptyInventory }</p>
            }
        </Fragment>
    }
}
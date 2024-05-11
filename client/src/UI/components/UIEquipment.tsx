import { Attributes, Component, ComponentChild, ComponentChildren, Fragment, Ref } from "preact"
import { EquipmentComponent, EquipmentSlot, EquipmentSlotNames } from "../../../../common/src/components/EquipmentComponent"
import { EquipmentSystem } from "../../../../common/src/systems/EquipmentSystem"
import { ClientDescriptionSystem } from "../../systems/ClientDescriptionSystem"
import { localize } from "../../lang/Lang"
import { NetworkEventHandler } from "../../events/NetworkEventHandler"
import { UnequipEvent } from "../../../../common/src/events/client/UnequipEvent"

type EquipmentState = {
    items: Record<EquipmentSlot, { name: string, id: number } | undefined>
}

type EquipmentProps = {
    descriptionSystem: ClientDescriptionSystem;
    equipmentSystem: EquipmentSystem;
    playerId: number;
}

export class UIEquipment extends Component<EquipmentProps, EquipmentState> {
    labels = {
        unequip: localize('action/unequip'),
        nothing: localize('misc/nothing')
    };
    state: EquipmentState = {
        items: {
            [EquipmentSlot.head]: undefined,
            [EquipmentSlot.body]: undefined,
            [EquipmentSlot.leftHand]: undefined,
            [EquipmentSlot.rightHand]: undefined,
            [EquipmentSlot.ring1]: undefined,
            [EquipmentSlot.ring2]: undefined,
            [EquipmentSlot.amulet]: undefined,
            [EquipmentSlot.legs]: undefined,
            [EquipmentSlot.feet]: undefined,
            [EquipmentSlot.back]: undefined
        }
    }

    equipmentNames: Record<EquipmentSlot, string> = {} as Record<EquipmentSlot, string>;

    componentDidMount(): void {
        this.props.equipmentSystem.componentUpdatedEmitter.subscribe((data) => {
            if (data.id !== this.props.playerId) {
                return;
            }

            const component = this.props.equipmentSystem.getComponent(data.id);
            if (!component) {
                return;
            }

            this.updateState(component);
        });

        for (const key in EquipmentSlotNames) {
            const slot = key as unknown as EquipmentSlot;
            this.equipmentNames[slot] = localize(EquipmentSlotNames[slot]);
        }

        const component = this.props.equipmentSystem.getComponent(this.props.playerId);
        this.updateState(component);
    }

    updateState(component?: EquipmentComponent): void {
        const items: Record<EquipmentSlot, { name: string, id: number } | undefined> = {
            [EquipmentSlot.head]: undefined,
            [EquipmentSlot.body]: undefined,
            [EquipmentSlot.leftHand]: undefined,
            [EquipmentSlot.rightHand]: undefined,
            [EquipmentSlot.ring1]: undefined,
            [EquipmentSlot.ring2]: undefined,
            [EquipmentSlot.amulet]: undefined,
            [EquipmentSlot.legs]: undefined,
            [EquipmentSlot.feet]: undefined,
            [EquipmentSlot.back]: undefined
        };

        for (const key in component?.items) {
            const slot = key as unknown as EquipmentSlot;
            const item = component?.items[slot] as number;
            items[slot] = {
                id: item,
                name: this.props.descriptionSystem.getLocalizedName(item)
            };
        }

        this.setState({ items });
    }

    unequip(slot: EquipmentSlot): void {
        NetworkEventHandler.sendEvent(new UnequipEvent(slot));
    }

    render(): ComponentChild {
        return <Fragment>
            <table>
                {Object.keys(this.state.items).map((key) => {
                    const slot = key as unknown as EquipmentSlot;
                    const item = this.state.items[slot];
                    return (<tr>
                        <td class="collapse">
                            { item ? <button class="icon-only" onClick={() => this.unequip(slot)} title={this.labels.unequip}><i class="icon curve-arrow"></i></button> : '' }
                        </td>
                        <td class="grow">
                            {this.equipmentNames[slot]}
                        </td>
                        <td>
                            {item ? item.name : this.labels.nothing }
                        </td>
                    </tr>)
                })}
            </table>         
        </Fragment>
    }
}
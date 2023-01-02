import { DescriptionClass, entityDescriptions } from "../../../common/src/components/DescriptionComponent";
import { DescriptionSystem } from "../../../common/src/systems/DescriptionSystem";
import { localize } from "../lang/Lang";

export class ClientDescriptionSystem extends DescriptionSystem {
    getDescriptionClass(entityId: number): DescriptionClass | undefined {
        const component = this.getComponent(entityId);
        if (!component) {
            return;
        }
        return (entityDescriptions[component.category] as Record<number, DescriptionClass>)[component.id];
    }

    getLocalizedDescription(entityId: number): string {
        const description = this.getDescriptionClass(entityId);
        if (!description) {
            return localize('misc/unknown');
        }
        const strings: string[] = [
            localize(`entity/${description.category}/description`),
        ];

        if (description.specific) {
            strings.push(localize(`entity/${description.specific}/description`));
        }

        return strings.join(' ');
    }

    getLocalizedName(entityId: number): string {
        const description = this.getDescriptionClass(entityId);
        if (!description) {
            return localize('misc/unknown');
        }
        const strings: string[] = [
            localize(`entity/${description.category}/name`),
        ];
        if (description.specific) {
            strings.push(localize(`entity/${description.specific}/name`));
        }
        return strings.join(' ');
    }
}
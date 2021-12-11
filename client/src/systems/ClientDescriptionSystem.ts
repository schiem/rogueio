import { DescriptionClass, entityDescriptions } from "../../../common/src/components/DescriptionComponent";
import { DescriptionSystem } from "../../../common/src/systems/DescriptionSystem";
import { localize } from "../lang/Lang";

export class ClientDescriptionSystem extends DescriptionSystem {
    getDescriptionClass(entityId: number): DescriptionClass | undefined {
        const component = this.getComponent(entityId);
        if (!component) {
            return;
        }
        return entityDescriptions[component.id];
    }

    getLocalizedDescription(entityId: number): Promise<string> {
        const description = this.getDescriptionClass(entityId);
        if (!description) {
            return localize('common/misc/unknown');
        }
        console.log(description);
        const promises: Promise<string>[] = [
            localize(`common/entity/${description.category}/description`),
        ];
        if (description.base) {
            promises.push(localize(`common/entity/${description.base}/description`));
        }
        return Promise.all(promises).then(strings => {
            return strings.join(' ');
        });
    }

    getLocalizedName(entityId: number): Promise<string> {
        const description = this.getDescriptionClass(entityId);
        if (!description) {
            return localize('common/misc/unknown');
        }
        const promises: Promise<string>[] = [
            localize(`common/entity/${description.category}/name`),
        ];
        if (description.base) {
            promises.push(localize(`common/entity/${description.base}/name`));
        }
        return Promise.all(promises).then(strings => {
            return strings.join(' ');
        });
    }
}
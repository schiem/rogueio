import { LocationComponent } from "../../../common/src/components/LocationComponent";
import { LocationSystem } from "../../../common/src/systems/LocationSystem";
import { Point } from "../../../common/src/types/Points";

export class ClientLocationSystem extends LocationSystem {
    componentPropertyUpdaters: Record<string, (id: number, component: LocationComponent, newValue: unknown) => unknown> = {
        location: (id: number, component: LocationComponent, newValue: unknown) => {
            const oldLocation = component.location;
            this.moveEntity(id, newValue as Point);
            return oldLocation;
        }
    };
}
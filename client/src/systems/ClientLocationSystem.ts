import { LocationComponent } from "../../../common/src/components/LocationComponent";
import { LocationSystem } from "../../../common/src/systems/LocationSystem";
import { Point } from "../../../common/src/types/Points";

export class ClientLocationSystem extends LocationSystem {
    componentPropertyUpdaters = {
        location: (id: number, component: LocationComponent, newValue: Point) => {
            this.moveEntity(id, newValue);
        }
    };
}
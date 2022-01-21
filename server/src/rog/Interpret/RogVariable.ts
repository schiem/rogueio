import { Callable } from "./Callable";
import { RuntimeError, RuntimeErrorType } from "./Interpreter";

export enum RogType {
    string,
    number,
    object,
    array,
    bool,
    nil,
    function
};

export class RogVariable {
    public type: RogType;
    constructor(
        public val: any
    ) {
        const type = typeof val;
        switch(type) {
            case 'string':
                this.type = RogType.string;
                break;
            case 'number':
                this.type = RogType.number;
                break;
            case 'boolean':
                this.type = RogType.bool;
                break;
            case 'object':
                if (Array.isArray(val)) {
                    this.type = RogType.array;
                } else if (val === null) {
                    this.type = RogType.nil;
                } else if (val instanceof Map) {
                    this.type = RogType.object;
                } else if (val instanceof Callable) {
                    this.type = RogType.function
                } else {
                    throw new RuntimeError(RuntimeErrorType.BAD_TYPE);
                }
                break;
            case 'undefined':
                this.type = RogType.nil;
                break;
            default:
                throw new RuntimeError(RuntimeErrorType.BAD_TYPE);
        }
    }
}

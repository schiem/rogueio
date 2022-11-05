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

export type LiteralRogType = Callable | Map<unknown, LiteralRogType> | LiteralRogType[] | boolean | number | string | null;

export const RogVariable = {
    getType: (value: unknown): RogType => {
        const type = typeof value;
        switch (type) {
            case 'string':
                return RogType.string;
            case 'number':
                return RogType.number;
            case 'boolean':
                return RogType.bool;
            case 'object':
                if (Array.isArray(value)) {
                    return RogType.array;
                } else if (value === null) {
                    return RogType.nil;
                } else if (value instanceof Map) {
                    return RogType.object;
                } else if (value instanceof Callable) {
                    return RogType.function
                } else {
                    throw new RuntimeError(RuntimeErrorType.BAD_TYPE);
                }
            case 'undefined':
                return RogType.nil;
            default:
                throw new RuntimeError(RuntimeErrorType.BAD_TYPE);
            }
    },
    toString: (value: LiteralRogType): string => {
        const type = RogVariable.getType(value);
        switch (type) {
            case RogType.string:
                return `"${(value as string)}"`;
            case RogType.number:
            case RogType.bool:
                return (value as number).toString();
            case RogType.nil:
                return 'nil';
            case RogType.function:
                return (value as Callable).toString();
            case RogType.array:
                return `[${(value as LiteralRogType[]).map(x => RogVariable.toString(x)).join(',')}]`;
            case RogType.object:
                let str = '{';
                const objValue = value as Map<string, LiteralRogType>;
                objValue.forEach((value, key) => {
                    str += `${key}: ${RogVariable.toString(value)},`;
                });
                str += '}';
                return str;
        }
    }
};

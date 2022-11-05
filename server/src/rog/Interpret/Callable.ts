import { FuncExpression } from "../Parse/Expression";
import { Environment } from "./Environment";
import { Interpreter } from "./Interpreter";
import { LiteralRogType } from "./RogVariable";

export abstract class Callable {
    abstract call(interpreter: Interpreter, ...args: LiteralRogType[]): LiteralRogType;
    abstract toString(): string;
    abstract arity(): number;
}

export class CallableFunction extends Callable {
    constructor(
        private functionExpression: FuncExpression,
        private closure: Environment
    ) {
        super();
    }

    call(interpreter: Interpreter, ...args: LiteralRogType[]): LiteralRogType {
        const newEnvironment = new Environment(this.closure);
        for(let i = 0; i < this.functionExpression.parameters.length; i++) {
            const param = this.functionExpression.parameters[i];
            newEnvironment.define(param.lexeme, args[i]);
        }
        return interpreter.executeStatements(this.functionExpression.statements, newEnvironment);
    };

    toString(): string {
        return `(${this.functionExpression.parameters.map((param) => param.lexeme).join(', ')}) => { ... }`;
    }

    arity(): number {
        return this.functionExpression.parameters.length;
    };
}

export class ExternalCallable extends Callable {
    constructor(
        private boundFunc: (...args: any[]) => LiteralRogType,
        private _arity: number
    ) {
        super();
    }
    call(interpreter: Interpreter, ...args: unknown[]): LiteralRogType {
        return this.boundFunc(...args);
    };

    toString(): string {
        return this.boundFunc.toString();
    }

    arity(): number {
        return this._arity;
    };
}
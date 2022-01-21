import { FuncExpression } from "../Parse/Expression";
import { Environment } from "./Environment";
import { Interpreter } from "./Interpreter";
import { RogVariable } from "./RogVariable";

export abstract class Callable {
    abstract call(interpreter: Interpreter, args: any[]): RogVariable;

    abstract arity(): number;
}

export class CallableFunction extends Callable {
    constructor(
        private functionExpression: FuncExpression,
        private closure: Environment
    ) {
        super();
    }

    call(interpreter: Interpreter, args: any[]): RogVariable {
        const newEnvironment = new Environment(this.closure);
        for(let i = 0; i < this.functionExpression.parameters.length; i++) {
            const param = this.functionExpression.parameters[i];
            newEnvironment.define(param.lexeme, args[i]);
        }
        return new RogVariable(interpreter.executeStatements(this.functionExpression.statements, newEnvironment));
    };

    arity(): number {
        return this.functionExpression.parameters.length;
    };
}

export class ExternalCallable extends Callable {
    constructor(
        private boundFunc: (...args: any[]) => RogVariable,
        private _arity: number
    ) {
        super();
    }
    call(interpreter: Interpreter, args: any[]): RogVariable {
        return this.boundFunc(...args);
    };

    arity(): number {
        return this._arity;
    };
}
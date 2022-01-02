import { FuncExpression } from "../Parse/Expression";
import { Environment } from "./Environment";
import { Interpreter } from "./Interpreter";

export class Callable {
    constructor(
        private functionExpression: FuncExpression,
        private closure: Environment
    ) {
    }

    call(interpreter: Interpreter, args: any[]): any {
        const newEnvironment = new Environment(this.closure);
        for(let i = 0; i < this.functionExpression.parameters.length; i++) {
            const param = this.functionExpression.parameters[i];
            newEnvironment.define(param.lexeme, args[i]);
        }
        return interpreter.executeStatements(this.functionExpression.statements, newEnvironment);
    };

    arity(): number {
        return this.functionExpression.parameters.length;
    };
}
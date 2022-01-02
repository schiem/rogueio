import { RuntimeError, RuntimeErrorType } from "./Interpreter";

export class Environment {
    private variables: Record<string, any> = {};
    
    constructor(private parentEnvironment: Environment | undefined = undefined) {}

    get(name: string): any {
        if (this.variables[name] !== undefined) {
            return this.variables[name];
        }

        if (this.parentEnvironment !== undefined) {
            return this.parentEnvironment.get(name);
        }

        throw new RuntimeError(RuntimeErrorType.VARIABLE_USED_BEFORE_DECLARED);
    }

    define(name: string, value: any): void {
        this.variables[name] = value;
    }

    assign(name: string, value: any): void {
        if (this.variables[name] === undefined) {
            if (this.parentEnvironment !== undefined) {
                return this.parentEnvironment.assign(name, value);
            }
            throw new RuntimeError(RuntimeErrorType.VARIABLE_ASSIGNED_BEFORE_DEFINED);
        }

        this.variables[name] = value;
    }

    getParent(): Environment | undefined {
        return this.parentEnvironment;
    };
}
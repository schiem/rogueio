import { RuntimeError, RuntimeErrorType } from "./Interpreter";
export class Environment {
    private variables: Record<string, any> = {};
    
    constructor(private parentEnvironment: Environment | undefined = undefined) {}

    ancestor(distance: number): Environment | undefined {
        let environment: Environment = this;
        for(let i = 0; i < distance; i++) {
            const nextEnvironment = environment.parentEnvironment;
            if (nextEnvironment === undefined) {
                return;
            }
            environment = nextEnvironment;
        }
        return environment;
    }

    assignAt(distance: number, name: string, value: any): void {
        const environment = this.ancestor(distance);
        if (!environment) {
            return;
        }

        environment.assign(name, value);
    }

    getAt(distance: number, name: string): any {
        const environment = this.ancestor(distance);
        return environment ? environment.get(name) : null;
    }

    get(name: string): any {
        console.log(`getting ${name}`);
        console.log(this.variables);
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
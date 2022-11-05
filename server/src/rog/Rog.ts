import { ExternalCallable } from "./Interpret/Callable";
import { Interpreter, RuntimeErrorStrings } from "./Interpret/Interpreter";
import { LiteralRogType } from "./Interpret/RogVariable";
import { ParseErrorStrings, Parser } from "./Parse/Parser";
import { Resolver, ResolverError, ResolverErrorStrings } from "./Resolver/Resolver";
import { ScanErrorStrings,  Scanner } from "./Scan/Scanner";

export class Rog {
    private interpreter = new Interpreter();
    run(source: string): { stdout: string[], stderr: string[] } {
        const scanner = new Scanner(source);
        const tokens = scanner.scan();
        const errors = scanner.getErrors();

        const errorStrings: string[] = [];
        if (errors.length > 0) {
            errors.forEach((error) => {
                errorStrings.push(`Received error "${ScanErrorStrings[error.errorCode]}" at ${error.line}:${error.index}`);
            });
            return { stderr: errorStrings, stdout: [] };
        }
        const parser = new Parser(tokens);
        const statements = parser.parse();
        if (statements instanceof Error) {
            errorStrings.push(`Parse Error: ${ParseErrorStrings[statements.type]}`);
            return { stderr: errorStrings, stdout: [] };
        }

        const resolver = new Resolver(this.interpreter);
        try {
            resolver.resolve(statements);
        } catch(e) {
            errorStrings.push(`Resolve Error: ${ResolverErrorStrings[(e as ResolverError).type]}`);
            return { stderr: errorStrings, stdout: [] };
        }

        const value = this.interpreter.interpret(statements);
        if (value instanceof Error) {
            errorStrings.push(`Runtime Error: ${RuntimeErrorStrings[value.type]}`);
            return { stderr: errorStrings, stdout: [] };
        }
        else {
            return { stderr: [], stdout: value };
        }
    }

    bindFunction(name: string, fn: (...args: any[]) => unknown, arity: number): void {
        const externalCallable = new ExternalCallable((...args: unknown[]) => {
            return this.marshallToRogType(fn(...args));
        }, arity);
        this.interpreter.bindGlobalVariable(name, externalCallable);
    }

    marshallToRogType(value: unknown): LiteralRogType {
        const type = typeof value;

        if (value === null || value === undefined) {
            return null;
        }

        if (type === 'boolean' || type === 'number' || type === 'string') {
            return value as LiteralRogType;
        }

        if (Array.isArray(value)) {
            return value.map(x => this.marshallToRogType(x));
        }
        else if (typeof value === 'object') {
            const map = new Map();
            for (const key in value) {
                map.set(key, this.marshallToRogType((value as Record<string, unknown>)[key]));
            }
            return map;
        }

        throw new Error(`Cannot marshall ${value} to valid RogType`);
    }
}
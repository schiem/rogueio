import { Interpreter, RuntimeErrorStrings } from "./Interpret/Interpreter";
import { ParseErrorStrings, Parser } from "./Parse/Parser";
import { Resolver, ResolverError, ResolverErrorStrings } from "./Resolver/Resolver";
import { ScanErrorStrings,  Scanner } from "./Scan/Scanner";

export class Rog {
    private interpreter = new Interpreter();
    run(source: string): void {
        const scanner = new Scanner(source);
        const tokens = scanner.scan();
        const errors = scanner.getErrors();

        if (errors.length > 0) {
            errors.forEach((error) => {
                console.log(`Received error "${ScanErrorStrings[error.errorCode]}" at ${error.line}:${error.index}`);
            });
            return;
        }
        const parser = new Parser(tokens);
        const statements = parser.parse();
        if (statements instanceof Error) {
            console.log(`Parse Error: ${ParseErrorStrings[statements.type]}`);
            return;
        }

        const resolver = new Resolver(this.interpreter);
        try {
            resolver.resolve(statements);
        } catch(e) {
            console.log(e);
            console.log(ResolverErrorStrings);
            console.log(`Resolve Error: ${ResolverErrorStrings[(e as ResolverError).type]}`);
            return;
        }

        const value = this.interpreter.interpret(statements);
        if (value instanceof Error) {
            console.log(`Runtime Error: ${RuntimeErrorStrings[value.type]}`);
            return;
        }
    }
}
import { Interpreter } from "./Interpret/Interpreter";
import { Parser } from "./Parse/Parser";
import { Resolver } from "./Resolver/Resolver";
import { ScanErrorType, Scanner } from "./Scan/Scanner";

export class Rog {
    static scanErrorStrings: Record<ScanErrorType, string> = {
        [ScanErrorType.BAD_CHARACTER]: 'Invalid character',
        [ScanErrorType.UNTERMINATED_STRING]: 'No closing string found'
    }
    private interpreter = new Interpreter();
    run(source: string): void {
        const scanner = new Scanner(source);
        const tokens = scanner.scan();
        const errors = scanner.getErrors();

        if (errors.length > 0) {
            errors.forEach((error) => {
                console.log(`Received error "${Rog.scanErrorStrings[error.errorCode]}" at ${error.line}:${error.index}`);
            });
            return;
        }
        const parser = new Parser(tokens);
        const statements = parser.parse();
        if (statements instanceof Error) {
            console.log("Error in parser!!!!");
            return;
        }

        const resolver = new Resolver(this.interpreter);
        try {
            resolver.resolve(statements);
        } catch(e) {
            console.log(e);
            console.log("Error in resolver!!!!");
            return;
        }

        const value = this.interpreter.interpret(statements);
        if (value instanceof Error) {
            console.log("Error in interpreter");
            return;
        }
    }
}
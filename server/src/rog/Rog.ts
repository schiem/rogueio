import { Interpreter } from "./Parse/Interpreter";
import { Parser } from "./Parse/Parser";
import { ScanErrorType, Scanner } from "./Scan/Scanner";

export class Rog {
    static scanErrorStrings: Record<ScanErrorType, string> = {
        [ScanErrorType.BAD_CHARACTER]: 'Invalid character',
        [ScanErrorType.UNTERMINATED_STRING]: 'No closing string found'
    }
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
        const expression = parser.parse();
        if (expression instanceof Error) {
            console.log("Error in parser!!!!");
        } else {
            const interpreter = new Interpreter(expression);
            const value = interpreter.interpret();
            if (value instanceof Error) {
                console.log("Error in interpreter");
            }
        }
    }
}
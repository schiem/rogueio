import { Expression } from "./Expression";
import { StatementVisitor } from "./StatementVisitor";

export abstract class Statement {
    abstract accept<T>(visitor: StatementVisitor<T>): T;
}

export class ExpressionStatement extends Statement {
    constructor(public expression: Expression) {
        super();
    }

    accept<T>(visitor: StatementVisitor<T>): T {
        return visitor.visitExpression(this);
    }
}
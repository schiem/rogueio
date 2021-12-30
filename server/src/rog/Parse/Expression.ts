import { Token } from "../Scan/Token";
import { ExpressionVisitor } from "./ExpressionVisitor";

export abstract class Expression {
    abstract accept<T>(visitor: ExpressionVisitor<T>): T;
}

export class BinaryExpression extends Expression {
    constructor(
        public readonly left: Expression,
        public readonly operator: Token,
        public readonly right: Expression
    ) {
        super();
    }

    accept<T>(visitor: ExpressionVisitor<T>): T {
        return visitor.visitBinary(this);
    }
}

export class GroupingExpression extends Expression {
    constructor(
        public readonly expr: Expression,
    ) {
        super();
    }

    accept<T>(visitor: ExpressionVisitor<T>): T {
        return visitor.visitGrouping(this);
    }
}

export class LiteralExpression extends Expression {
    constructor(
        public readonly value: any,
    ) {
        super();
    }

    accept<T>(visitor: ExpressionVisitor<T>): T {
        return visitor.visitLiteral(this);
    }
}

export class UnaryExpression extends Expression {
    constructor(
        public readonly operator: Token,
        public readonly right: Expression
    ) {
        super();
    }

    accept<T>(visitor: ExpressionVisitor<T>): T {
        return visitor.visitUnary(this);
    }
}

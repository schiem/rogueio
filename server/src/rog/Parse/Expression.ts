import { Token } from "../Scan/Token";
import { ExpressionVisitor } from "./ExpressionVisitor";
import { Statement } from "./Statement";

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

export class VariableExpression extends Expression {
    constructor(
        public readonly name: Token 
    ) {
        super();
    }

    accept<T>(visitor: ExpressionVisitor<T>): T {
        return visitor.visitVariable(this);
    }
}

export class AssignmentExpression extends Expression {
    constructor(
        public readonly name: Token,
        public readonly value: Expression 
    ) {
        super();
    }

    accept<T>(visitor: ExpressionVisitor<T>): T {
        return visitor.visitAssignment(this);
    }
}

export class LogicalExpression extends Expression {
    constructor(
        public readonly left: Expression,
        public readonly operator: Token,
        public readonly right: Expression
    ) {
        super();
    }

    accept<T>(visitor: ExpressionVisitor<T>): T {
        return visitor.visitLogical(this);
    }
}

export class CallExpression extends Expression {
    constructor(
        public callee: Expression, 
        public paren: Token, 
        public args: Expression[]
    ) {
        super();
    }

    accept<T>(visitor: ExpressionVisitor<T>): T {
        return visitor.visitCall(this);
    }
}

export class FuncExpression extends Expression {
    constructor(
        public parameters: Token[],
        public statements: Statement[]
    ) {
        super();
    }

    accept<T>(visitor: ExpressionVisitor<T>): T {
        return visitor.visitFunc(this);
    }
}

export class ObjectExpression extends Expression {
    constructor(
        public keys: Token[],
        public values: Expression[]
    ) {
        super();
    }

    accept<T>(visitor: ExpressionVisitor<T>): T {
        return visitor.visitObject(this);
    }
}

export class ArrayExpression extends Expression {
    constructor(
        public values: Expression[]
    ) {
        super();
    }

    accept<T>(visitor: ExpressionVisitor<T>): T {
        return visitor.visitArray(this);
    }
}

export class GetExpression extends Expression {
    constructor(
        public property: Expression 
    ) {
        super();
    }

    accept<T>(visitor: ExpressionVisitor<T>): T {
        return visitor.visitGet(this);
    }
}
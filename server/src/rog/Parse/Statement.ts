import { Token } from "../Scan/Token";
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

export class VarDeclStatement extends Statement {
    constructor(public name: Token, public initializer: Expression | undefined) {
        super();
    }

    accept<T>(visitor: StatementVisitor<T>): T {
        return visitor.visitVarDecl(this);
    }
}

export class IfStatement extends Statement {
    constructor(public condition: Expression, public thenBlock: Statement[], public elseBlock: Statement[] | undefined) {
        super();
    }

    accept<T>(visitor: StatementVisitor<T>): T {
        return visitor.visitIf(this);
    }
}

export class WhileStatement extends Statement {
    constructor(public condition: Expression, public block: Statement[]) {
        super();
    }

    accept<T>(visitor: StatementVisitor<T>): T {
        return visitor.visitWhile(this);
    }
}

export class ForStatement extends Statement {
    constructor(
        public initializer: VarDeclStatement | ExpressionStatement | undefined, 
        public finalCondition: Expression | undefined, 
        public increment: Expression | undefined,
        public statements: Statement[]) {
            super();
        }

    accept<T>(visitor: StatementVisitor<T>): T {
        return visitor.visitFor(this);
    }
}

export class ReturnStatement extends Statement {
    constructor(
        public token: Token,
        public expression?: Expression
    ) {
        super();
    }

    accept<T>(visitor: StatementVisitor<T>): T {
        return visitor.visitReturn(this);
    }
}
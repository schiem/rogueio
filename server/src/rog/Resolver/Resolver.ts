import { Interpreter } from "../Interpret/Interpreter";
import { BinaryExpression, UnaryExpression, LiteralExpression, GroupingExpression, VariableExpression, AssignmentExpression, LogicalExpression, CallExpression, FuncExpression, Expression, ArrayExpression, GetExpression, ObjectExpression } from "../Parse/Expression";
import { ExpressionVisitor } from "../Parse/ExpressionVisitor";
import { ExpressionStatement, VarDeclStatement, IfStatement, WhileStatement, ForStatement, ReturnStatement, Statement } from "../Parse/Statement";
import { StatementVisitor } from "../Parse/StatementVisitor";
import { Token } from "../Scan/Token";

export class Resolver implements ExpressionVisitor<void>, StatementVisitor<void> {
    private scopes: (Record<string, boolean>)[] = [];
    private inFunction = false;
    constructor(
        private interpreter: Interpreter
    ) {}

    // Statements
    visitExpression(statement: ExpressionStatement): void {
        this.resolveExpression(statement.expression);
    }

    visitVarDecl(statement: VarDeclStatement): void {
        this.declare(statement.name);

        if (statement.initializer !== undefined) {
            this.resolveExpression(statement.initializer);
        }

        this.define(statement.name);
    }

    visitIf(statement: IfStatement): void {
        this.resolveExpression(statement.condition);
        this.resolveBlock(statement.thenBlock);
        if (statement.elseBlock !== undefined) {
            this.resolveBlock(statement.elseBlock);
        }
    }

    visitWhile(statement: WhileStatement): void {
        this.resolveExpression(statement.condition);
        this.resolveBlock(statement.block);
    }

    visitFor(statement: ForStatement): void {
        this.beginScope();
        if (statement.initializer !== undefined) {
            this.resolveStatement(statement.initializer);
        }

        if (statement.finalCondition !== undefined) {
            this.resolveExpression(statement.finalCondition);
        }

        if (statement.increment !== undefined) {
            this.resolveExpression(statement.increment);
        }

        this.resolveBlock(statement.statements);

        this.endScope();
    }

    visitReturn(statement: ReturnStatement): void {
        if (!this.inFunction) {
            throw new ResolverError(ResolverErrorType.INVALID_RETURN);
        }
        if (statement.expression !== undefined) {
            this.resolveExpression(statement.expression);
        }
    }

    // Expressions
    visitBinary(expression: BinaryExpression): void {
        this.resolveExpression(expression.left);
        this.resolveExpression(expression.right);
    }

    visitUnary(expression: UnaryExpression): void {
        this.resolveExpression(expression.right);
    }

    visitLiteral(expression: LiteralExpression): void {}

    visitGrouping(expression: GroupingExpression): void {
        this.resolveExpression(expression.expr);
    }

    visitVariable(expression: VariableExpression): void {
        if (this.scopes.length === 0) {
            return;
        }

        if (this.peekScope()[expression.name.lexeme] === false) {
            throw new ResolverError(ResolverErrorType.READ_DURING_INITIALIZATION);
        }

        this.resolveLocal(expression, expression.name);
    }

    visitAssignment(expression: AssignmentExpression): void {
        this.resolveExpression(expression.value);
        this.resolveLocal(expression, expression.name);
    }

    visitLogical(expression: LogicalExpression): void {
        this.resolveExpression(expression.left);
        this.resolveExpression(expression.right);
    }

    visitCall(expression: CallExpression): void {
        this.resolveExpression(expression.callee);
        expression.args.forEach((arg) => {
            this.resolveExpression(arg);
        });
    }

    visitFunc(expression: FuncExpression): void {
        // Store the old value to reset to later

        const inFunction = this.inFunction;
        this.inFunction = true;
        this.beginScope();
        expression.parameters.forEach((value) => {
            this.declare(value);
            this.define(value);
        });
        this.resolve(expression.statements);
        this.endScope();
        this.inFunction = inFunction;
    }

    visitObject(expression: ObjectExpression): void {
        expression.values.forEach((value) => {
            this.resolveExpression(value);
        });
    }

    visitArray(expression: ArrayExpression): void {
        expression.values.forEach((value) => {
            this.resolveExpression(value);
        });
    }

    visitGet(expression: GetExpression): void {
        this.resolveExpression(expression.object);
    }

    private beginScope(): void {
        this.scopes.push({});
    }

    private endScope(): void {
        this.scopes.pop();
    }

    private declare(token: Token): void {
        if (this.scopes.length === 0) {
            return;
        }

        const scope = this.peekScope();
        if (scope[token.lexeme] !== undefined) {
            throw new ResolverError(ResolverErrorType.REASSIGNED_VARIABLE);
        }
        scope[token.lexeme] = false;
    }

    private define(token: Token): void {
        if (this.scopes.length === 0) {
            return;
        }

        const scope = this.peekScope();
        scope[token.lexeme] = true;
    }

    private resolveLocal(expression: Expression, token: Token): void {
        for(let i = this.scopes.length - 1; i >= 0; i--) {
            const scope = this.scopes[i];
            if (scope[token.lexeme] !== undefined) {
                this.interpreter.resolve(expression, this.scopes.length - 1 - i);
                return;
            }
        }
    }

    resolve(statements: Statement[]): void {
        statements.forEach((statement) => {
            this.resolveStatement(statement);
        });
    }

    private peekScope(): Record<string, boolean> {
        return this.scopes[this.scopes.length - 1];
    }

    private resolveBlock(statements: Statement[]): void {
        this.beginScope();
        this.resolve(statements);
        this.endScope();
    }

    private resolveStatement(statement: Statement): void {
        statement.accept(this);
    }

    private resolveExpression(expression: Expression): void {
        expression.accept(this);
    }
}

export class ResolverError extends Error {
    constructor(public type: ResolverErrorType) {
        super();
    }
}

export enum ResolverErrorType {
    READ_DURING_INITIALIZATION,
    REASSIGNED_VARIABLE,
    INVALID_RETURN
}
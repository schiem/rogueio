import { Token, TokenType } from "../Scan/Token";
import { BinaryExpression, UnaryExpression, LiteralExpression, GroupingExpression, Expression, VariableExpression, AssignmentExpression, LogicalExpression, CallExpression, FuncExpression } from "../Parse/Expression";
import { ExpressionVisitor } from "../Parse/ExpressionVisitor";
import { ExpressionStatement, ForStatement, IfStatement, ReturnStatement, Statement, VarDeclStatement, WhileStatement } from "../Parse/Statement";
import { StatementVisitor } from "../Parse/StatementVisitor";
import { Environment } from "./Environment";
import { Callable } from "./Callable";

export class Interpreter implements ExpressionVisitor<any>, StatementVisitor<void> {
    private environment: Environment;
    private global: Environment = new Environment();
    private locals: Map<Expression, number> = new Map();

    private retVal: any = undefined;

    constructor() {
        this.environment = this.global;
    }
    interpret(statements: Statement[]): undefined | RuntimeError {
        try {
            statements.forEach((statement) => {
                this.execute(statement);
            });
            return;
        } catch (e) {
            console.log(e);
            return e;
        }
    }

    // Statement visitors
    visitVarDecl(statement: VarDeclStatement): void {
        let value = null;
        if (statement.initializer !== undefined) {
            value = this.evaluate(statement.initializer);
        }
        this.environment.define(statement.name.lexeme, value);
    }

    visitFor(statement: ForStatement): void {
        // Create a scope just for the 'for' portion
        const outerEnvironment = this.environment;
        this.environment = new Environment(outerEnvironment);
        if (statement.initializer !== undefined) {
            this.execute(statement.initializer);
        }

        while (statement.finalCondition === undefined || this.isTruthy(this.evaluate(statement.finalCondition))) {
            // Execute the body
            const environment = new Environment(this.environment);
            this.executeStatements(statement.statements, environment);
            if (this.retVal !== undefined) {
                break;
            }

            // Execute the incrementor
            if (statement.increment !== undefined) {
                this.evaluate(statement.increment);
            }
        }

        // reset the environment
        this.environment = outerEnvironment;
    }

    visitIf(statement: IfStatement): void {
        if (this.isTruthy(this.evaluate(statement.condition))) {
            // Create a new scoping
            const environment = new Environment(this.environment);
            this.executeStatements(statement.thenBlock, environment);
        } else if (statement.elseBlock !== undefined) {
            const environment = new Environment(this.environment);
            this.executeStatements(statement.thenBlock, environment);
        }
    }

    visitWhile(statement: WhileStatement): void {
        while (this.isTruthy(this.evaluate(statement.condition))) {
            // Create a new scoping
            const environment = new Environment(this.environment);
            this.executeStatements(statement.block, environment);

            if (this.retVal !== undefined) {
                break;
            }
        }
    }

    visitReturn(statement: ReturnStatement): void {
        // Set the retVal
        if (statement.expression !== undefined) {
            this.retVal = this.evaluate(statement.expression);
        }
    }

    visitExpression(statement: ExpressionStatement): void {
        // TODO - remove the console.log
        console.log(this.evaluate(statement.expression));
    }

    //Expression visitors
    visitBinary(expression: BinaryExpression) {
        const left = this.evaluate(expression.left);
        const right = this.evaluate(expression.right);

        switch (expression.operator.type) {
            case TokenType.LESS:
                this.checkType(right, 'number');
                return left < right;
            case TokenType.LESS_EQUAL:
                this.checkType(right, 'number');
                return left <= right;
            case TokenType.GREATER:
                this.checkType(right, 'number');
                return left > right;
            case TokenType.GREATER_EQUAL:
                this.checkType(right, 'number');
                return left >= right;
            case TokenType.EQUAL_EQUAL:
                return left === right;
            case TokenType.BANG_EQUAL:
                return left !== right;
            case TokenType.MINUS:
                this.checkTypes(left, right, 'number', 'number');
                return left - right;
            case TokenType.STAR:
                this.checkTypes(left, right, 'number', 'number');
                return left * right;
            case TokenType.SLASH:
                this.checkTypes(left, right, 'number', 'number');
                return left / right;
            case TokenType.PLUS:
                if (typeof left === 'number' && typeof right === 'number') {
                    return left + right;
                }
                if (typeof left === 'number' && typeof right === 'number') {
                    return `${left}${right}`;
                }
                this.panic(RuntimeErrorType.BAD_TYPE);
        }
        return null;
    }


    visitUnary(expression: UnaryExpression) {
        const right = this.evaluate(expression.right);

        switch (expression.operator.type) {
            case TokenType.MINUS:
                this.checkType(right, 'number');
                return -1 * right;
            case TokenType.BANG:
                return !this.isTruthy(right);
        }
        //error state
        return null;
    }

    visitLiteral(expression: LiteralExpression): any {
        return expression.value;
    }
    visitGrouping(expression: GroupingExpression): any {
        return this.evaluate(expression.expr);
    }

    visitVariable(expression: VariableExpression): any {
        return this.visitLocal(expression.name, expression);
    }

    visitAssignment(expression: AssignmentExpression): any {
        const value = this.evaluate(expression.value);
        const distance = this.locals.get(expression);
        if (distance !== undefined) {
            this.environment.assignAt(distance, expression.name.lexeme, value);
        } else {
            this.global.assign(expression.name.lexeme, value);
        }
    }

    visitLogical(expression: LogicalExpression): any {
        const left = this.evaluate(expression.left);

        const leftIsTruthy = this.isTruthy(left);
        const operatorType: TokenType = expression.operator.type;
        if ((leftIsTruthy && (operatorType === TokenType.OR)) || (!leftIsTruthy && (operatorType === TokenType.AND))) {
            return left;
        }

        return this.evaluate(expression.right);
    }

    visitCall(expression: CallExpression): any {
        const callee = this.evaluate(expression.callee);
        const args = expression.args.map((arg) => this.evaluate(arg));

        if (!(callee instanceof Callable)) {
            this.panic(RuntimeErrorType.CANNOT_CALL);
        }

        if (args.length !== callee.arity()) {
            this.panic(RuntimeErrorType.INCORRECT_ARG_LENGTH);
        }

        const returnValue = callee.call(this, args);
        if (this.retVal !== undefined) {
            this.retVal = undefined;
        }
        return returnValue;
    }

    visitFunc(expression: FuncExpression): any {
        return new Callable(expression, this.environment);
    }

    executeStatements(statements: Statement[], context?: Environment): any {
        let originalEnvironment = this.environment;
        if (context !== undefined) {
            this.environment = context;
        }

        let retVal: any = null;
        for (let i = 0; i < statements.length; i++) {
            this.execute(statements[i]);
            if (this.retVal) {
                retVal = this.retVal;
                break;
            }
        }

        if (context !== undefined) {
            this.environment = originalEnvironment;
        }

        return retVal;
    }


    resolve(expression: Expression, depth: number): void {
        this.locals.set(expression, depth);
    }

    private panic(type: RuntimeErrorType): never {
        throw new RuntimeError(type);
    }

    private checkType(val: any, type: string): void | never {
        if (typeof val !== type) {
            this.panic(RuntimeErrorType.BAD_TYPE);
        }
    }

    private checkTypes(left: any, right: any, leftType: string, rightType: string): void | never {
        if (typeof left !== leftType || typeof right !== rightType) {
            this.panic(RuntimeErrorType.BAD_TYPE);
        }
    }

    private execute(statement: Statement): void {
        statement.accept(this);
    }

    private evaluate(expression: Expression): any {
        return expression.accept(this);
    }

    private isTruthy(val: any): boolean {
        if (val === undefined || val === null) {
            return false;
        }
        if (typeof val === 'boolean') {
            return val;
        }
        return true;
    }

    private visitLocal(name: Token, expression: Expression): void {
        const distance = this.locals.get(expression);
        if (distance !== undefined) {
            return this.environment.getAt(distance, name.lexeme);
        } else {
            return this.global.get(name.lexeme);
        }
    }
}

export class RuntimeError extends Error {
    constructor(public type: RuntimeErrorType) {
        super();
    }
}

export enum RuntimeErrorType {
    BAD_TYPE,
    VARIABLE_USED_BEFORE_DECLARED,
    VARIABLE_ASSIGNED_BEFORE_DEFINED,
    INCORRECT_ARG_LENGTH,
    CANNOT_CALL
}
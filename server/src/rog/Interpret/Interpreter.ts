import { Token, TokenType } from "../Scan/Token";
import { BinaryExpression, UnaryExpression, LiteralExpression, GroupingExpression, Expression, VariableExpression, AssignmentExpression, LogicalExpression, CallExpression, FuncExpression, ArrayExpression, GetExpression, ObjectExpression } from "../Parse/Expression";
import { ExpressionVisitor } from "../Parse/ExpressionVisitor";
import { ExpressionStatement, ForStatement, IfStatement, ReturnStatement, Statement, VarDeclStatement, WhileStatement } from "../Parse/Statement";
import { StatementVisitor } from "../Parse/StatementVisitor";
import { Environment } from "./Environment";
import { Callable, CallableFunction, ExternalCallable } from "./Callable";
import { RogType, LiteralRogType, RogVariable } from "./RogVariable";

export class Interpreter implements ExpressionVisitor<LiteralRogType>, StatementVisitor<LiteralRogType | void> {
    private environment: Environment;
    private global: Environment = new Environment();
    private locals: Map<Expression, number> = new Map();

    // This is insanely inefficient.  But hey, so is a tree walking parser
    private builtIns: Record<RogType, Record<string, (object: LiteralRogType) => Callable>> = {
        [RogType.string]: {
            length: (object: LiteralRogType) => new ExternalCallable(() => { return (object as string).length; }, 0)
        },
        [RogType.number]: {
        },
        [RogType.array]: {
            length: (object: LiteralRogType) => new ExternalCallable(() => { return (object as unknown[]).length; }, 0)
        },
        [RogType.object]: {
        },
        [RogType.bool]: {
        },
        [RogType.nil]: {
        },
        [RogType.function]: {
        }
    }

    private retVal: LiteralRogType = null;

    constructor() {
        this.environment = this.global;
        this.bindDefaultFunctions();
    }

    bindDefaultFunctions(): void {
        this.bindGlobalVariable('dump', new ExternalCallable((value: LiteralRogType): LiteralRogType => {
            return RogVariable.toString(value);
        }, 1));
    }

    interpret(statements: Statement[]): string[] | RuntimeError {
        try {
            const strings: string[] = [];
            statements.forEach((statement) => {
                const result = this.execute(statement);
                if (result !== undefined) {
                    strings.push(result?.toString() || 'nil');
                }
            });
            return strings;
        } catch (e) {
            return e as RuntimeError;
        }
    }

    // Statement visitors
    visitVarDecl(statement: VarDeclStatement): null {
        let value = null;
        if (statement.initializer !== undefined) {
            value = this.evaluate(statement.initializer);
        }
        this.environment.define(statement.name.lexeme, value);
        return null;
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

    visitExpression(statement: ExpressionStatement): LiteralRogType {
        return this.evaluate(statement.expression);
    }

    //Expression visitors
    visitBinary(expression: BinaryExpression): LiteralRogType {
        const left = this.evaluate(expression.left);
        const right = this.evaluate(expression.right);

        switch (expression.operator.type) {
            case TokenType.LESS:
                this.checkType(right, 'number');
                return (left as boolean) < (right as boolean);
            case TokenType.LESS_EQUAL:
                this.checkType(right, 'number');
                return (left as boolean) <= (right as boolean);
            case TokenType.GREATER:
                this.checkType(right, 'number');
                return (left as boolean) > (right as boolean);
            case TokenType.GREATER_EQUAL:
                this.checkType(right, 'number');
                return (left as boolean) >= (right as boolean);
            case TokenType.EQUAL_EQUAL:
                return left === right;
            case TokenType.BANG_EQUAL:
                return left !== right;
            case TokenType.MINUS:
                this.checkTypes(left, right, 'number', 'number');
                return (left as number) - (right as number);
            case TokenType.STAR:
                this.checkTypes(left, right, 'number', 'number');
                return (left as number) * (right as number);
            case TokenType.SLASH:
                this.checkTypes(left, right, 'number', 'number');
                return (left as number) / (right as number);
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


    visitUnary(expression: UnaryExpression): LiteralRogType {
        const right = this.evaluate(expression.right);

        switch (expression.operator.type) {
            case TokenType.MINUS:
                this.checkType(right, 'number');
                return -1 * (right as number);
            case TokenType.BANG:
                return !this.isTruthy(right);
        }
        //error state
        return null;
    }

    visitLiteral(expression: LiteralExpression): LiteralRogType {
        return expression.value;
    }
    visitGrouping(expression: GroupingExpression): LiteralRogType {
        return this.evaluate(expression.expr);
    }

    visitVariable(expression: VariableExpression): LiteralRogType {
        return this.visitLocal(expression.name, expression);
    }

    visitAssignment(expression: AssignmentExpression): LiteralRogType {
        const value = this.evaluate(expression.value);
        const distance = this.locals.get(expression);
        if (distance !== undefined) {
            this.environment.assignAt(distance, expression.name.lexeme, value);
        } else {
            this.global.assign(expression.name.lexeme, value);
        }
        return null;
    }

    visitLogical(expression: LogicalExpression): LiteralRogType {
        const left = this.evaluate(expression.left);

        const leftIsTruthy = this.isTruthy(left);
        const operatorType: TokenType = expression.operator.type;
        if ((leftIsTruthy && (operatorType === TokenType.OR)) || (!leftIsTruthy && (operatorType === TokenType.AND))) {
            return left;
        }

        return this.evaluate(expression.right);
    }

    visitCall(expression: CallExpression): LiteralRogType {
        const callee = this.evaluate(expression.callee);
        const args = expression.args.map((arg) => this.evaluate(arg));

        if (!(callee instanceof Callable)) {
            this.panic(RuntimeErrorType.CANNOT_CALL);
        }

        if (args.length !== callee.arity()) {
            this.panic(RuntimeErrorType.INCORRECT_ARG_LENGTH);
        }

        const returnValue = callee.call(this, ...args);
        if (this.retVal !== undefined) {
            this.retVal = null;
        }
        return returnValue;
    }

    visitFunc(expression: FuncExpression): Callable {
        return new CallableFunction(expression, this.environment);
    }

    visitArray(expression: ArrayExpression): LiteralRogType {
        return expression.values.map(value => {
            return this.evaluate(value);
        });
    }

    visitObject(expression: ObjectExpression): LiteralRogType {
        const object = new Map();

        for (let i = 0; i < expression.keys.length; i++) {
            const key = this.evaluate(expression.keys[i]);
            const value = this.evaluate(expression.values[i]);
            object.set(key, value);
        }

        return object;
    }

    visitGet(expression: GetExpression): LiteralRogType {
        const object = this.evaluate(expression.object);
        const name = this.evaluate(expression.name) as string;

        if (typeof name === 'string') {
            const builtIn = this.lookupBuiltin(RogVariable.getType(object), name);
            if (builtIn !== undefined) {
                return builtIn(object);
            }
        }

        if (typeof object !== 'object') {
            this.panic(RuntimeErrorType.CANNOT_ACCESS_PROPERTY);
        }

        if (Array.isArray(object)) {
            const index = parseInt(name);
            if (isNaN(index)) {
                this.panic(RuntimeErrorType.INVALID_ACCESS_TYPE);
            }

            if (index > object.length - 1 || index < 0) {
                this.panic(RuntimeErrorType.BAD_INDEX);
            }
            return object[index];
        } else if (object instanceof Map) {
            if (!object.has(name)) {
                this.panic(RuntimeErrorType.CANNOT_ACCESS_PROPERTY);
            }
            return object.get(name) as LiteralRogType;
        }

        return null;
    }

    executeStatements(statements: Statement[], context?: Environment): LiteralRogType {
        let originalEnvironment = this.environment;
        if (context !== undefined) {
            this.environment = context;
        }

        let retVal: LiteralRogType = null;
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

    bindGlobalVariable(name: string, value: LiteralRogType): void {
        this.global.define(name, value);
    }

    private lookupBuiltin(type: RogType, name: string): (object: LiteralRogType) => Callable {
        return this.builtIns[type][name];
    }

    private panic(type: RuntimeErrorType): never {
        throw new RuntimeError(type);
    }

    private checkType(val: unknown, type: string): void | never {
        if (typeof val !== type) {
            this.panic(RuntimeErrorType.BAD_TYPE);
        }
    }

    private checkTypes(left: unknown, right: unknown, leftType: string, rightType: string): void | never {
        if (typeof left !== leftType || typeof right !== rightType) {
            this.panic(RuntimeErrorType.BAD_TYPE);
        }
    }

    private execute(statement: Statement): LiteralRogType | void {
        return statement.accept(this as StatementVisitor<void | LiteralRogType>);
    }

    private evaluate(expression: Expression): LiteralRogType {
        return expression.accept(this);
    }

    private isTruthy(val: unknown): boolean {
        if (val === undefined || val === null) {
            return false;
        }
        if (typeof val === 'boolean') {
            return val;
        }
        return true;
    }

    private visitLocal(name: Token, expression: Expression): LiteralRogType {
        const distance = this.locals.get(expression);
        if (distance !== undefined) {
            return this.environment.getAt(distance, name.lexeme);
        } else {
            return this.global.get(name.lexeme);
        }
    }
}

export enum RuntimeErrorType {
    BAD_TYPE,
    VARIABLE_USED_BEFORE_DECLARED,
    VARIABLE_ASSIGNED_BEFORE_DEFINED,
    INCORRECT_ARG_LENGTH,
    CANNOT_CALL,
    CANNOT_ACCESS_PROPERTY,
    INVALID_ACCESS_TYPE,
    BAD_INDEX
}

export const RuntimeErrorStrings: Record<RuntimeErrorType, string> = {
    [RuntimeErrorType.BAD_TYPE]: 'Bad type',
    [RuntimeErrorType.VARIABLE_USED_BEFORE_DECLARED]: 'Variable used before declaraction',
    [RuntimeErrorType.VARIABLE_ASSIGNED_BEFORE_DEFINED]: 'Variable assigned before definition',
    [RuntimeErrorType.INCORRECT_ARG_LENGTH]: 'Incorrect number of args',
    [RuntimeErrorType.CANNOT_CALL]: 'Cannot call non-function',
    [RuntimeErrorType.CANNOT_ACCESS_PROPERTY]: 'Cannot access invalid property',
    [RuntimeErrorType.INVALID_ACCESS_TYPE]: 'Cannot index array with non-number',
    [RuntimeErrorType.BAD_INDEX]: 'Cannot fetch item at array index'
}

export class RuntimeError extends Error {
    constructor(public type: RuntimeErrorType) {
        super();
    }
}
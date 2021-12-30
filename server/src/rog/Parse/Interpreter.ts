import { TokenType } from "../Scan/Token";
import { BinaryExpression, UnaryExpression, LiteralExpression, GroupingExpression, Expression } from "./Expression";
import { ExpressionVisitor } from "./ExpressionVisitor";

export class Interpreter implements ExpressionVisitor<any> {
    constructor(private expression: Expression) {}

    interpret(): undefined | RuntimeError {
        try {
            console.log(this.evaluate(this.expression));
            return;
        } catch (e) {
            return e;
        }
    }

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

    checkType(val: any, type: string): void | never {
        if (typeof val !== type) {
            this.panic(RuntimeErrorType.BAD_TYPE);
        }
    }

    checkTypes(left: any, right: any, leftType: string, rightType: string): void | never {
        if (typeof left !== leftType || typeof right !== rightType) {
            this.panic(RuntimeErrorType.BAD_TYPE);
        }
    }

    evaluate(expression: Expression): any {
        return expression.accept(this);
    }

    isTruthy(val: any): boolean {
        if (val === undefined || val === null) {
            return false;
        }
        if (typeof val === 'boolean') {
            return val;
        }
        return true;
    }

    panic(type: RuntimeErrorType): never {
        throw new RuntimeError(type);
    }
}

export class RuntimeError extends Error {
    constructor(public type: RuntimeErrorType) {
        super();
    }
}

export enum RuntimeErrorType {
    BAD_TYPE
}
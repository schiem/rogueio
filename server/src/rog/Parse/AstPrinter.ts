import { BinaryExpression, UnaryExpression, LiteralExpression, GroupingExpression, Expression, VariableExpression, AssignmentExpression, LogicalExpression, CallExpression, FuncExpression, ObjectExpression, ArrayExpression, GetExpression } from "./Expression";
import { ExpressionVisitor } from "./ExpressionVisitor";

export class AstPrinter implements ExpressionVisitor<string> {

    toString(expression: Expression): string {
        return expression.accept(this);
    }

    visitBinary(expression: BinaryExpression): string {
        return this.parenthize(expression.operator.lexeme, expression.left, expression.right);
    }
    visitUnary(expression: UnaryExpression): string {
        return this.parenthize(expression.operator.lexeme, expression.right);
    }

    visitLiteral(expression: LiteralExpression): string {
        if (expression.value === undefined || expression.value === null) {
            return 'nil';
        }
        return (expression.value as string).toString();
    }

    visitGrouping(expression: GroupingExpression): string {
        return this.parenthize('group', expression.expr);
    }

    visitVariable(expression: VariableExpression): string {
        return expression.name.lexeme;
    }

    visitAssignment(expression: AssignmentExpression): string {
        return `${expression.name.lexeme} = ${this.toString(expression.value)}`;
    }

    visitLogical(expression: LogicalExpression): string {
        return `${this.toString(expression.left)}} ${expression.operator.lexeme} ${this.toString(expression.right)}`;
    }

    visitCall(expression: CallExpression): string {
        return `${this.toString(expression.callee)} ${expression.paren.lexeme} ${expression.args.map(exp => this.toString(exp)).join(', ')}`;
    }

    visitFunc(expression: FuncExpression): string {
        return `(${expression.parameters.map((param) => param.lexeme).join(', ')}) => { ... }`;
    }

    visitObject(expression: ObjectExpression): string {
        const kvps = [];
        for (let i = 0; i < expression.keys.length; i++) {
            kvps.push(`${expression.keys[i]}: ${this.toString(expression.values[i])}`);
        }

        return `{${kvps.join(',')}}`;
    }

    visitArray(expression: ArrayExpression): string {
        return `[${expression.values.join(',')}]`;
    }

    visitGet(expression: GetExpression): string {
        return `${this.toString(expression.object)}[${expression.name.toString()}`;
    }

    private parenthize(name: string, ...expressions: Expression[]): string {
        return `(${name} ${expressions.map((expression) => expression.accept(this)).join(' ')})`;
    }
}
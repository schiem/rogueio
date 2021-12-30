import { BinaryExpression, UnaryExpression, LiteralExpression, GroupingExpression, Expression } from "./Expression";
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
        return expression.value.toString();
    }
    visitGrouping(expression: GroupingExpression): string {
        return this.parenthize('group', expression.expr);
    }

    private parenthize(name: string, ...expressions: Expression[]): string {
        return `(${name} ${expressions.map((expression) => expression.accept(this)).join(' ')})`;
    }
}
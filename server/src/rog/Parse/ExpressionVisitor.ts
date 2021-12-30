import { BinaryExpression, UnaryExpression, LiteralExpression, GroupingExpression } from "./Expression";

export interface ExpressionVisitor<T> {
    visitBinary(expression: BinaryExpression): T;
    visitUnary(expression: UnaryExpression): T;
    visitLiteral(expression: LiteralExpression): T;
    visitGrouping(expression: GroupingExpression): T;
}
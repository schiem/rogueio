import { BinaryExpression, UnaryExpression, LiteralExpression, GroupingExpression, VariableExpression, AssignmentExpression, LogicalExpression, CallExpression, FuncExpression, ObjectExpression, ArrayExpression, GetExpression } from "./Expression";

export interface ExpressionVisitor<T> {
    visitBinary(expression: BinaryExpression): T;
    visitUnary(expression: UnaryExpression): T;
    visitLiteral(expression: LiteralExpression): T;
    visitGrouping(expression: GroupingExpression): T;
    visitVariable(expression: VariableExpression): T;
    visitAssignment(expression: AssignmentExpression): T;
    visitLogical(expression: LogicalExpression): T;
    visitCall(expression: CallExpression): T;
    visitFunc(expression: FuncExpression): T;
    visitObject(expression: ObjectExpression): T;
    visitArray(expression: ArrayExpression): T;
    visitGet(expression: GetExpression): T;
}
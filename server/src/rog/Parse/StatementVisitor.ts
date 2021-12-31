import { ExpressionStatement } from "./Statement";

export interface StatementVisitor<T> {
    visitExpression(statement: ExpressionStatement): T;
}
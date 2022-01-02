import { ExpressionStatement, ForStatement, IfStatement, ReturnStatement, VarDeclStatement, WhileStatement } from "./Statement";

export interface StatementVisitor<T> {
    visitExpression(statement: ExpressionStatement): T;
    visitVarDecl(statement: VarDeclStatement): T;
    visitIf(statement: IfStatement): T;
    visitWhile(statement: WhileStatement): T;
    visitFor(statement: ForStatement): T;
    visitReturn(statement: ReturnStatement): T;
}
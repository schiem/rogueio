import { Token, TokenType } from "../Scan/Token";
import { AssignmentExpression, BinaryExpression, CallExpression, Expression, FuncExpression, GroupingExpression, LiteralExpression, LogicalExpression, UnaryExpression, VariableExpression } from "./Expression";
import { ExpressionStatement, ForStatement, IfStatement, ReturnStatement, Statement, VarDeclStatement, WhileStatement } from "./Statement";

/**
 * Formal Grammar:
 * program        → statement* EOF ;
 *
 * statement      → exprStmt
 *                  | forStmt
 *                  | ifStmt
 *                  | whileStmt
 *                  | varDeclStmt 
 *                  | funStmt ;
 * 
 * forStmt        → "for" "(" ( varDeclStmt | exprStmt | ";" )
 *                  expression? ";"
 *                  expression? ")" "{" statement "}"
 * 
 * ifStmt         → "if" "(" expression ")" "{" statement "}"
 *                  ( "else" "{" statement "}" )? ;
 * 
 * whileStmt      → "while" "(" expression ")" "{" statement "}" ;
 * 
 * varDeclStmt    → "var" IDENTIFIER ( "=" ( expression )? ; 
 * 
 * returnStmt     → "return" expression?; 
 * 
 * exprStmt       → expression ";" ;
 * 
 * expression     → assignment;
 * assignment     → IDENTIFIER "=" ( assignment )
 *                  | logic_or ;
 * logic_or       → logic_and ( "or" logic_and )* ;
 * logic_and      → equality ( "and" equality )* ;
 * equality       → comparison ( ( "!=" | "==" ) comparison )* ;
 * comparison     → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
 * term           → factor ( ( "-" | "+" ) factor )* ;
 * factor         → unary ( ( "/" | "*" ) unary )* ;
 * unary          → ( "!" | "-" ) unary
 *                  | call ;
 * call           → primary ( "(" arguments? ")" )* ; 
 * arguments      → expression ( "," expression )* ;
 * primary        → NUMBER | STRING | "true" | "false" | "nil"
 *                  | "(" expression ")" 
 *                  | func
 *                  | IDENTIFIER ;
 * func           → "(" parameters? ")" "=>" "{" ( statement )+ "}" ;
 */
export class Parser {
    private current: number = 0;
    constructor(private readonly tokens: Token[]) {}

    parse(): Statement[] | ParseError {
        const statements: Statement[] = [];
        try {
            while (!this.isAtEnd()) {
                statements.push(this.statement());
            }

            return statements;
        } catch(e: any) {
            console.log(e);
            return e;
        }
    }

    private statement(): Statement {
        if (this.match(TokenType.FOR)) {
            return this.forStatement();
        }

        if (this.match(TokenType.IF)) {
            return this.ifStatement();
        }

        if (this.match(TokenType.WHILE)) {
            return this.whileStatement();
        }

        if (this.match(TokenType.VAR)) {
            return this.varDeclStatement();
        }

        if (this.match(TokenType.RETURN)) {
            return this.returnStatement();
        }

        return this.expressionStatement();
    }

    private forStatement(): ForStatement {
        this.consume(TokenType.LEFT_PAREN, ParseErrorType.EXPECTED_LITERAL);

        let initializer: VarDeclStatement | ExpressionStatement | undefined;
        if (this.match(TokenType.SEMICOLON)) {
            initializer = undefined;
        } else if (this.match(TokenType.VAR)) {
            initializer = this.varDeclStatement();
        } else {
            initializer = this.expressionStatement();
        }

        // Consume an expression terminated by ;, or a single ;
        let condition: Expression | undefined = undefined;
        if (!this.match(TokenType.SEMICOLON)) {
            condition = this.expression();
            this.consume(TokenType.SEMICOLON, ParseErrorType.EXPECTED_SEMICOLON);
        }

        // Consume an expression terminated by ;, or a single ;
        let incrementor: Expression | undefined = undefined;
        if (!this.match(TokenType.SEMICOLON)) {
            incrementor = this.expression();
        }

        this.consume(TokenType.RIGHT_PAREN, ParseErrorType.EXPECTED_LITERAL);
        this.consume(TokenType.LEFT_BRACE, ParseErrorType.EXPECTED_LITERAL);

        const statements: Statement[] = []
        while (!this.match(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
            statements.push(this.statement());
        }

        if (statements.length === 0) {
            this.panic(ParseErrorType.EXPECTED_EXPRESSION);
        }

        return new ForStatement(initializer, condition, incrementor, statements);
    }

    private ifStatement(): IfStatement {
        this.consume(TokenType.LEFT_PAREN, ParseErrorType.EXPECTED_LITERAL);
        const condition = this.expression();
        this.consume(TokenType.RIGHT_PAREN, ParseErrorType.EXPECTED_LITERAL);

        const statements: Statement[] = [];
        this.consume(TokenType.LEFT_BRACE, ParseErrorType.EXPECTED_LITERAL);

        while (!this.match(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
            statements.push(this.statement());
        }
        
        if (this.previous().type !== TokenType.RIGHT_BRACE) {
            // Hit the end instead of a right brace
            this.panic(ParseErrorType.EXPECTED_LITERAL);
        }

        let elseStatements: Statement[] | undefined = undefined;
        if (this.match(TokenType.ELSE)) {
            elseStatements = [];
            this.consume(TokenType.LEFT_BRACE, ParseErrorType.EXPECTED_LITERAL);

            while (!this.match(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
                elseStatements.push(this.statement());
            }
            
            if (this.previous().type !== TokenType.RIGHT_BRACE) {
                // Hit the end instead of a right brace
                this.panic(ParseErrorType.EXPECTED_LITERAL);
            }
        }

        if (statements.length === 0 || (elseStatements !== undefined && elseStatements.length === 0)) {
            this.panic(ParseErrorType.EXPECTED_EXPRESSION);
        }

        return new IfStatement(condition, statements, elseStatements);
    }

    private whileStatement(): WhileStatement {
        this.consume(TokenType.LEFT_PAREN, ParseErrorType.EXPECTED_LITERAL);
        const condition = this.expression();
        this.consume(TokenType.RIGHT_PAREN, ParseErrorType.EXPECTED_LITERAL);

        const statements: Statement[] = [];
        this.consume(TokenType.LEFT_BRACE, ParseErrorType.EXPECTED_LITERAL);

        while (!this.match(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
            statements.push(this.statement());
        }

        if (statements.length === 0) {
            this.panic(ParseErrorType.EXPECTED_EXPRESSION);
        }

        return new WhileStatement(condition, statements);
    }

    private varDeclStatement(): VarDeclStatement {
        const token = this.consume(TokenType.IDENTIFIER, ParseErrorType.EXPECTED_IDENTIFIER);
        let initializer: Expression | undefined = undefined;
        if (this.match(TokenType.EQUAL)) {
            initializer = this.expression();
        }
        this.consume(TokenType.SEMICOLON, ParseErrorType.EXPECTED_SEMICOLON);
        return new VarDeclStatement(token, initializer)
    }

    private returnStatement(): ReturnStatement {
        const ret = this.previous();
        let expression: Expression | undefined = undefined;
        if (!this.check(TokenType.SEMICOLON)) {
            expression = this.expression();
        }
        this.consume(TokenType.SEMICOLON, ParseErrorType.EXPECTED_SEMICOLON);
        return new ReturnStatement(ret, expression);
    }

    private expressionStatement(): ExpressionStatement {
        const statement = new ExpressionStatement(this.expression());
        this.consume(TokenType.SEMICOLON, ParseErrorType.EXPECTED_SEMICOLON);
        return statement;
    }

    private expression(): Expression {
        return this.assignment();
    }

    private assignment(): Expression {
        const left = this.or();

        if (this.match(TokenType.EQUAL)) {
            if (left instanceof VariableExpression) {
                const value: Expression = this.assignment();
                const name  = left.name;
                return new AssignmentExpression(name, value);
            }
            this.panic(ParseErrorType.INVALID_ASSIGNMENT)
        }

        return left;
    }

    private or(): Expression {
        let left = this.and();
        while (this.match(TokenType.OR)) {
            const operator = this.previous();
            const right = this.and();
            left = new LogicalExpression(left, operator, right);
        }

        return left;
    }

    private and(): Expression {
        let left = this.equality();

        while (this.match(TokenType.AND)) {
            const operator = this.previous();
            const right = this.and();
            left = new LogicalExpression(left, operator, right);
        }


        return left;
    }

    private equality(): Expression {
        let expression = this.comparison();

        while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
            const operator: Token = this.previous();
            const right: Expression = this.comparison();
            expression = new BinaryExpression(expression, operator, right);
        }
        return expression;
    }

    private comparison(): Expression {
        let expression = this.term();

        while (this.match(TokenType.GREATER, TokenType.LESS, TokenType.GREATER_EQUAL, TokenType.LESS_EQUAL)) {
            const operator: Token = this.previous();
            const right: Expression = this.term();
            expression = new BinaryExpression(expression, operator, right);
        }

        return expression;
    }

    private term(): Expression {
        let expression = this.factor(); 

        while (this.match(TokenType.PLUS, TokenType.MINUS)) {
            const operator: Token = this.previous();
            const right: Expression = this.factor();
            expression = new BinaryExpression(expression, operator, right);
        }

        return expression;
    }

    private factor(): Expression {
        let expression = this.unary();

        while (this.match(TokenType.STAR, TokenType.SLASH)) {
            const operator: Token = this.previous();
            const right: Expression = this.unary();
            expression = new BinaryExpression(expression, operator, right);
        }

        return expression;
    }

    private unary(): Expression {
        while (this.match(TokenType.BANG, TokenType.MINUS)) {
            const operator: Token = this.previous();
            const right: Expression = this.unary();
            return new UnaryExpression(operator, right);
        }
        return this.call();
    }

    private call(): Expression {
        let expression = this.primary();

        while (true) {
            if (this.match(TokenType.LEFT_PAREN)) {
                expression = this.finishCall(expression);
            } else {
                break;
            }
        }
        return expression;
    }

    private finishCall(callee: Expression): Expression {
        const args: Expression[] = [];

        if (!this.check(TokenType.RIGHT_PAREN)) {
            do {
                args.push(this.expression());
            } while (this.match(TokenType.COMMA));
        }

        const paren = this.consume(TokenType.RIGHT_PAREN, ParseErrorType.UNMATCHED_PAREN);
        return new CallExpression(callee, paren, args);
    }

    private primary(): Expression {
        if (this.match(TokenType.TRUE)) {
            return new LiteralExpression(true);
        }
        if (this.match(TokenType.FALSE)) {
            return new LiteralExpression(false);
        }
        if (this.match(TokenType.NIL)) {
            return new LiteralExpression(null);
        }

        if (this.match(TokenType.NUMBER, TokenType.STRING)) {
            return new LiteralExpression(this.previous().literal);
        }

        // Group or function
        if (this.match(TokenType.LEFT_PAREN)) {
            const start = this.current;
            const functionParams = this.funcParams();
            if (functionParams !== undefined) {
                return this.func(functionParams, this.funcBody());
            } else {
                // We may have consumed some tokens in the process of checking for a function, reset
                this.seek(start);
                const expression = this.expression();
                this.consume(TokenType.RIGHT_PAREN, ParseErrorType.UNMATCHED_PAREN);
                return new GroupingExpression(expression);
            }
        }

        if (this.match(TokenType.IDENTIFIER)) {
            return new VariableExpression(this.previous().lexeme);
        }

        this.panic(ParseErrorType.EXPECTED_EXPRESSION);
    }

    private func(parameters: Token[], statements: Statement[]): FuncExpression {
        return new FuncExpression(parameters, statements);
    }

    private funcBody(): Statement[] {
        this.consume(TokenType.LEFT_BRACE, ParseErrorType.EXPECTED_LITERAL);

        const statements: Statement[] = [];
        while (!this.match(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
            statements.push(this.statement());
        }
        return statements;
    }

    // Returns either the set of tokens that make up function params, 
    // OR undefined if it doesn't actually match a function.
    // Begins after an open paren, and consumes through the "=>"
    private funcParams(): Token[] | undefined {
        const parameters: Token[] = [];

        if (!this.match(TokenType.RIGHT_PAREN)) {
            do {
                if (this.match(TokenType.IDENTIFIER)) {
                    parameters.push(this.previous());
                } else {
                    return;
                }
            } while (this.match(TokenType.COMMA));

            if (!this.match(TokenType.RIGHT_PAREN)) {
                return;
            }
        }

        if (!this.match(TokenType.EQUAL_ARROW)) {
            return;
        }

        return parameters;
    }

    private panic(errorType: ParseErrorType): never {
        throw new ParseError(errorType);
    }

    private consume(type: TokenType, errorType: ParseErrorType): Token {
        if (this.check(type)) {
            return this.advance();
        }

        this.panic(errorType);
    }

    private match(...tokenTypes: TokenType[]): boolean {
        for(let i = 0; i < tokenTypes.length; i++) {
            if (this.isAtEnd()) {
                return false;
            }
            if (this.check(tokenTypes[i])) {
                this.advance();
                return true;
            }
        }
        return false;
    }

    private previous(): Token {
        if (this.current === 0) {
            throw new Error('Cannot look back from the first token');
        }

        return this.tokens[this.current - 1];
    }

    private check(type: TokenType): boolean {
        return this.peek().type === type;
    }

    private seek(location: number): void {
        this.current = location;
    }

    private peek(): Token {
        return this.tokens[this.current];
    }

    private advance(): Token {
        const token = this.tokens[this.current];
        if (!this.isAtEnd()) {
            this.current++;
        }
        return token;
    }

    private isAtEnd(): boolean {
        return this.check(TokenType.EOF);
    }
}

export enum ParseErrorType {
    UNMATCHED_PAREN,
    EXPECTED_EXPRESSION,
    EXPECTED_SEMICOLON,
    EXPECTED_IDENTIFIER,
    EXPECTED_LITERAL,
    INVALID_ASSIGNMENT
}

export class ParseError extends Error {
    constructor(public type: ParseErrorType) {
        super();
    }
}
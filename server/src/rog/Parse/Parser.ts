import { Token, TokenType } from "../Scan/Token";
import { BinaryExpression, Expression, GroupingExpression, LiteralExpression, UnaryExpression } from "./Expression";

/**
 * Formal Grammar:
 * expression     → equality ;
 * equality       → comparison ( ( "!=" | "==" ) comparison )* ;
 * comparison     → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
 * term           → factor ( ( "-" | "+" ) factor )* ;
 * factor         → unary ( ( "/" | "*" ) unary )* ;
 * unary          → ( "!" | "-" ) unary
 *                  | primary ;
 * primary        → NUMBER | STRING | "true" | "false" | "nil"
 *                  | "(" expression ")" ;
 */
export class Parser {
    private current: number = 0;
    constructor(private readonly tokens: Token[]) {}

    parse(): Expression | ParseError {
        try {
            return this.expression();
        } catch(e) {
            return e;
        }
    }

    private expression(): Expression {
        return this.equality();
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
        return this.primary();
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

        if (this.match(TokenType.LEFT_PAREN)) {
            const expression = this.expression();
            this.consume(TokenType.RIGHT_PAREN, ParseErrorType.UNMATCHED_PAREN);
            return new GroupingExpression(expression);
        }
        this.panic(ParseErrorType.EXPECTED_EXPRESSION);
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
}

export class ParseError extends Error {
    constructor(public type: ParseErrorType) {
        super();
    }
}
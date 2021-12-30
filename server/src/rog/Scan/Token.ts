export class Token {
    constructor(
        public readonly type: TokenType,
        public readonly lexeme: string,
        public readonly literal: any,
        public readonly line: number,
    ) {}

    toString(): void {
        console.log(`${this.type} : ${this.lexeme} | ${this.literal}`);
    }
}

export enum TokenType {
    LEFT_PAREN, RIGHT_PAREN, LEFT_BRACE, RIGHT_BRACE, LEFT_BRACKET, RIGHT_BRACKET,
    COMMA, DOT, MINUS, PLUS, SEMICOLON, SLASH, STAR,

    // One or two character tokens.
    BANG, BANG_EQUAL,
    EQUAL, EQUAL_EQUAL, EQUAL_ARROW,
    GREATER, GREATER_EQUAL,
    LESS, LESS_EQUAL,

    // Two character tokens
    AND, OR,

    // Literals.
    IDENTIFIER, STRING, NUMBER,

    // Keywords.
    ELSE, FALSE, FOR, IF, NIL,
    PRINT, RETURN, TRUE, VAR, WHILE,

    EOF
}
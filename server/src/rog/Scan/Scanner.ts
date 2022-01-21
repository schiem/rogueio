import { Token, TokenType } from "./Token";
/**
 * A scanner which defines the grammar.
 * 
 * @see TokenType for a list of valid token types.
 * 
 * The tokens are as follows:
 * - Single Character Token List: /()[]{},.-+;*=!><
 * - Two Character Token List: == != >= <= => || && //
 * - Any string literal between double quotes (double quotes can be escaped with \)
 * - Any number (floating or integer)
 * - Any keyword (@see Scanner.keyword)
 * - Any alphanumeric identified beginning with a letter
 * 
 * All whitespace is ignored.
 */

export class Scanner {
    private current = 0;
    private currentTokenIndex = 0;
    private line = 1;

    private tokens: Token[] = [];
    private errors: ScanError[] = [];

    static keywords: Record<string, TokenType> = {
        "else":   TokenType.ELSE,
        "false":  TokenType.FALSE,
        "for":    TokenType.FOR,
        "if":     TokenType.IF,
        "nil":    TokenType.NIL,
        "print":  TokenType.PRINT,
        "return": TokenType.RETURN,
        "true":   TokenType.TRUE,
        "var":    TokenType.VAR,
        "while":  TokenType.WHILE,
    };

    constructor(private source: string) {}

    scan(): Token[] {
        while (!this.reachedEnd()) {
            this.currentTokenIndex = this.current;
            this.scanNextToken();
        }
        this.tokens.push(new Token(TokenType.EOF, '', null, this.line));

        return this.tokens;
    }

    getErrors(): ScanError[] {
        return this.errors;
    }

    private scanNextToken(): void {
        const char = this.advance();
        switch(char) {
            case '(': this.addToken(TokenType.LEFT_PAREN); break;
            case ')': this.addToken(TokenType.RIGHT_PAREN); break;
            case '{': this.addToken(TokenType.LEFT_BRACE); break;
            case '}': this.addToken(TokenType.RIGHT_BRACE); break;
            case '[': this.addToken(TokenType.LEFT_BRACKET); break;
            case ']': this.addToken(TokenType.RIGHT_BRACKET); break;
            case ',': this.addToken(TokenType.COMMA); break;
            case '.': this.addToken(TokenType.DOT); break;
            case '-': this.addToken(TokenType.MINUS); break;
            case '+': this.addToken(TokenType.PLUS); break;
            case ';': this.addToken(TokenType.SEMICOLON); break;
            case ':': this.addToken(TokenType.COLON); break;
            case '*': this.addToken(TokenType.STAR); break; 
            case '|': 
                if (this.match('|')) {
                    this.addToken(TokenType.OR)
                } else {
                    this.addError(char, ScanErrorType.BAD_CHARACTER); 
                }
                break;
            case '&': 
                if (this.match('&')) {
                    this.addToken(TokenType.AND)
                } else {
                    this.addError(char, ScanErrorType.BAD_CHARACTER); 
                }
                break;
            case '!':
                this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG);
                break;
            case '=':
                if (this.match('=')) {
                    this.addToken(TokenType.EQUAL_EQUAL);
                } else if (this.match('>')) {
                    this.addToken(TokenType.EQUAL_ARROW);
                } else {
                    this.addToken(TokenType.EQUAL);
                }
                break;
            case '<':
                this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS);
                break;
            case '>':
                this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER);
                break;
            case '/':
                if (this.match('/')) {
                    // Ignore comments
                    while (this.peek() !== '\n' && !this.reachedEnd()) {
                        this.advance();
                    }
                } else {
                    this.addToken(TokenType.SLASH);
                }
                break;
            case '\r':
            case '\t':
            case ' ':
                break;
            case '\n':
                this.line++;
                break;
            case '"': this.string(); break;
            default: 
                if (this.isDigit(char)) {
                    this.number();
                } else if (this.isAlpha(char)) {
                    this.identifier();
                } else {
                    this.addError(char, ScanErrorType.BAD_CHARACTER); 
                }
                break;
        }
    }

    private identifier(): void {
        while (this.isAlphaNumeric(this.peek())) {
            this.advance();
        }

        const keywordMatch = this.source.slice(this.currentTokenIndex, this.current);
        let keyword = Scanner.keywords[keywordMatch];
        if (keyword === undefined) {
            keyword = TokenType.IDENTIFIER;
        }
        this.addToken(keyword);
    }

    private number(): void {
        while (this.isDigit(this.peek())) {
            this.advance();
        }

        if (this.peek() === '.' && this.isDigit(this.peekNext())) {
            // consume the period
            this.advance();

            // continue reading digits
            while (this.isDigit(this.peek())) {
                this.advance();
            }
        }

        this.addToken(TokenType.NUMBER, parseFloat(this.source.slice(this.currentTokenIndex, this.current)));
    }

    private string(): void {
        let escaped = false;
        while (true) {
            const char = this.advance();
            if (char === '"' && !escaped) {
                // Reached end of string, stop iterating
                break;
            } if (char === '\n') {
                this.line++;
            }

            if (char === '\\') {
                // Begin an escape sequence
                escaped = true;
            } else {
                // End the escape sequence 
                escaped = false;
            }

            if (this.reachedEnd()) {
                // End of string, throw error and leave function
                this.addError('', ScanErrorType.UNTERMINATED_STRING);
                return;
            }
        }

        const value = this.source.slice(this.currentTokenIndex + 1, this.current - 1);
        this.addToken(TokenType.STRING, value);
    }

    private addError(char: string, type: ScanErrorType): void {
        this.errors.push(new ScanError(this.line, this.current, char, type));
    }

    private reachedEnd(): boolean {
        return this.current >= this.source.length;
    }

    private peekNext(): string {
        if (this.current + 1 >= this.source.length) {
            return '\0';
        }
        return this.source.charAt(this.current + 1);
    }

    private peek(): string {
        return this.source.charAt(this.current);
    }

    private advance(): string {
        return this.source.charAt(this.current++);
    }

    private match(char: string): boolean {
        if (this.reachedEnd()) {
            return false;
        }
        if (this.source.charAt(this.current) !== char) {
            return false;
        }

        this.current++;
        return true;
    }

    private addToken(type: TokenType, literal?: any): void {
        this.tokens.push(new Token(type, this.source.slice(this.currentTokenIndex, this.current), literal, this.line));
    }

    private isDigit(char: string): boolean {
        return char >= '0' && char <= '9';
    }

    private isAlpha(char: string): boolean {
        return char === '_' || (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z');
    }

    private isAlphaNumeric(char: string): boolean {
        return this.isAlpha(char) || this.isDigit(char);
    }
}

export enum ScanErrorType {
    BAD_CHARACTER,
    UNTERMINATED_STRING
}

class ScanError {
    constructor(
        public line: number,
        public index: number,
        public character: string,
        public errorCode: ScanErrorType
    ) {}
}

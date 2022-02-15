
import { CustomError } from 'ts-custom-error'
import { Token, TokenKind } from './lex';
import { Ast, AstExpr, AstExprKind } from './ast';
import unimplemented from 'ts-unimplemented';
import { not, symbol } from './astExprMaker';

export class ParseError extends CustomError {
    constructor(reason: string, tokens: Token[] | null = null, index: number | null = null) {
        function show(tokens: Token[], index: number) {
            let tokenKind = tokens[index]?.type;
            return "at index " + index + " with token kind " + (tokenKind ? TokenKind[tokenKind] : null);
        }

        if (tokens !== null && index !== null) {
            super(reason + "\n" + show(tokens, index));
        } else {
            super(reason);
        }
    }
}

export class Parser {
    index: number = 0;
    premises: AstExpr[] = [];

    constructor(public tokens: Token[]) { }

    error(reason: string): ParseError {
        return new ParseError(reason, this.tokens, this.index);
    }

    parse(): Ast | ParseError {
        this.skipLineSeparators();

        while (this.index < this.tokens.length) {
            let line = this.parseExpr();

            if (line instanceof ParseError) {
                return line;
            } else {
                this.premises.push(line);
            }

            this.skipLineSeparators();
        }

        let conclusion = this.premises.pop();

        if (conclusion === undefined) {
            return new ParseError("No conclusion specified");
        } else {
            return new Ast(this.premises, conclusion);
        }
    }

    parseExpr(): AstExpr | ParseError {
        let primary = this.parsePrimaryExpr();
        return primary instanceof ParseError ? primary : this.parseOpExpr(0, primary);
    }

    parsePrimaryExpr(): AstExpr | ParseError {
        let token = this.next();

        switch (token?.type) {
            case TokenKind.Symbol:
                return symbol(token.name);
            case TokenKind.Not: {
                let inner = this.parsePrimaryExpr();

                if (inner instanceof ParseError) {
                    return inner;
                } else {
                    return not(inner);
                }
            }
            case TokenKind.Open: {
                let inner = this.parseExpr();

                if (inner instanceof ParseError || this.next()?.type == TokenKind.Close) {
                    return inner;
                } else {
                    return this.error("Failed to parse expression - expected ')' to close grouping");
                }
            }
            case null:
                return this.error("Failed to parse expression - out of tokens");
            default:
                return this.error("Failed to parse expression - expected expression");
        }
    }

    parseOpExpr(precedence: number, primary: AstExpr): AstExpr | ParseError {
        while (true) {
            let operator = this.peek();
            let operatorPrecedence = getOperatorPrecedence(operator?.type);

            if (operatorPrecedence === null || operatorPrecedence < precedence) {
                return primary;
            }

            switch (operator?.type) {
                case TokenKind.And:
                case TokenKind.Or:
                case TokenKind.Implies: {
                    let binaryExpr = this.parseBinaryExpr(primary, operatorPrecedence);

                    if (binaryExpr instanceof ParseError) {
                        return binaryExpr;
                    } else {
                        primary = binaryExpr;
                    }

                    break;
                }
                default:
                    return primary;
            }
        }
    }

    parseBinaryExpr(lhs: AstExpr, operatorPrecedence: number): AstExpr | ParseError {
        let operatorToken = this.next();

        if (operatorToken !== null) {
            let rhs = this.parseRightHandSideExpr(operatorPrecedence);

            if (rhs instanceof ParseError) {
                return rhs;
            }

            return { type: getBinaryOperator(operatorToken.type), a: lhs, b: rhs };
        } else {
            return this.error("Expected operator");
        }
    }

    parseRightHandSideExpr(operatorPrecedence: number): AstExpr | ParseError {
        let rhs = this.parsePrimaryExpr();

        if (rhs instanceof ParseError) {
            return rhs;
        }

        let nextOperatorPrecedence = getOperatorPrecedence(this.peek()?.type);

        if (nextOperatorPrecedence !== null && operatorPrecedence < nextOperatorPrecedence) {
            return this.parseOpExpr(operatorPrecedence + 1, rhs);
        } else {
            return rhs;
        }
    }

    skipLineSeparators() {
        while (this.index < this.tokens.length
            && this.tokens[this.index].type == TokenKind.NextLine) {
            this.index++;
        }
    }

    next(): Token | null {
        return (this.index < this.tokens.length) ? this.tokens[this.index++] : null;
    }

    peek(): Token | null {
        return (this.index < this.tokens.length) ? this.tokens[this.index] : null;
    }
}

export function parse(tokens: Token[]): Ast | ParseError {
    return new Parser(tokens).parse();
}

function getOperatorPrecedence(type: TokenKind | null | undefined): number | null {
    switch (type) {
        case TokenKind.Not:
            return 6;
        case TokenKind.And:
        case TokenKind.Or:
            return 5;
        case TokenKind.Implies:
            return 4;
        default:
            return null;
    }
}

function getBinaryOperator(type: TokenKind): AstExprKind.And | AstExprKind.Or | AstExprKind.Implies {
    switch (type) {
        case TokenKind.And: return AstExprKind.And;
        case TokenKind.Or: return AstExprKind.Or;
        case TokenKind.Implies: return AstExprKind.Implies;
    }

    throw new Error("getBinaryOperator() got unrecognized binary operator token");
}

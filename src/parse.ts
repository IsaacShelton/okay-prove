
import { Token, TokenKind } from './lex';

export enum AstExprKind {
    Symbol,
    Not,
    And,
    Or,
    Implies,
    Any,
    All,
}

export type AstExpr =
    | { type: AstExprKind.Symbol, name: string }
    | { type: AstExprKind.And | AstExprKind.Or | AstExprKind.Implies, a: AstExpr, b: AstExpr }
    | { type: AstExprKind.Not, child: AstExpr }
    | { type: AstExprKind.Any, children: AstExpr[] }
    | { type: AstExprKind.All, children: AstExpr[] }

export class Ast {
    premises: AstExpr[];
    conclusion: AstExpr;

    constructor(premises: AstExpr[], conclusion: AstExpr) {
        this.premises = premises;
        this.conclusion = conclusion;
    }
}

export class ParseError {
    reason: string;

    constructor(reason: string) {
        this.reason = reason;
    }

    toString() {
        return this.reason;
    }
}

export function parse(tokens: Token[]): Ast | ParseError {
    let premises: AstExpr[] = [];
    let conclusion: AstExpr | null = null;

    // TODO: Parse tokens into premises and conclusion

    if (conclusion == null) {
        return new ParseError("No conclusion specified");
    } else {
        return new Ast(premises, conclusion);
    }
}

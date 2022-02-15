
import fastDeepEqual from 'fast-deep-equal';

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
    constructor(public premises: AstExpr[], public conclusion: AstExpr) { }
}

export function areExprsIdentical(a: AstExpr, b: AstExpr): boolean {
    return fastDeepEqual(a, b);
}

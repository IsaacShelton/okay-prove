
import { Justification } from './justification';

export enum AstExprKind {
    Symbol,
    Not,
    And,
    Or,
    Implies,
    Any,
    All,
    Contradiction,
    Tautology,
}

// Used to indicate preference when facing user,
// Operations applied to the holding expression will use reasoning
// names based on flavor
// e.g. Flavor.Implies for `or(not("a"), "b")` will using implies-related
// naming of reasoning for eliminations and more
export enum Flavor {
    Naked,
    Implies,
}

export type AstSymbolExpr = { type: AstExprKind.Symbol, name: string, justification?: Justification };
export type AstBinaryExpr = { type: AstExprKind.And | AstExprKind.Or | AstExprKind.Implies, a: AstExpr, b: AstExpr, justification?: Justification, flavor: Flavor }
export type AstNotExpr = { type: AstExprKind.Not, child: AstExpr, justification?: Justification };
export type AstSelectExpr = { type: AstExprKind.Any | AstExprKind.All, children: AstExpr[], justification?: Justification };
export type AstAssertExpr = { type: AstExprKind.Contradiction | AstExprKind.Tautology, justification?: Justification };

export type AstExpr =
    | AstSymbolExpr
    | AstBinaryExpr
    | AstNotExpr
    | AstSelectExpr
    | AstAssertExpr

export class Ast {
    constructor(public premises: AstExpr[], public conclusion: AstExpr) { }
}

// NOTE: Does not consider justifications when determining
// whether two expressions are identical
export function areExprsIdentical(a: AstExpr, b: AstExpr): boolean {
    if (a.type !== b.type) return false;

    switch (a.type) {
        case AstExprKind.Symbol:
            return a.name == (b as AstSymbolExpr).name;
        case AstExprKind.Not:
            return areExprsIdentical(a.child, (b as AstNotExpr).child);
        case AstExprKind.And:
        case AstExprKind.Or:
        case AstExprKind.Implies:
            return areExprsIdentical(a.a, (b as AstBinaryExpr).a)
                && areExprsIdentical(a.b, (b as AstBinaryExpr).b);
        case AstExprKind.Any:
        case AstExprKind.All: {
            let aSelect = a;
            let bSelect = b as AstSelectExpr;

            if (aSelect.children.length != bSelect.children.length) {
                return false;
            }

            for (let i = 0; i < aSelect.children.length; i++) {
                if (!areExprsIdentical(aSelect.children[i], bSelect.children[i])) {
                    return false;
                }
            }

            return true;
        }
        case AstExprKind.Contradiction:
        case AstExprKind.Tautology:
            return true;
    }

    throw new Error("areExprsEqual() cannot compare expr of unrecognized type");
}

export function isExprIncluded(array: AstExpr[], isolated: AstExpr): boolean {
    for (let expr of array) {
        if (areExprsIdentical(expr, isolated)) {
            return true;
        }
    }

    return false;
}

export function mergeExprLists(list1: AstExpr[], list2: AstExpr[]): AstExpr[] {
    let newList = [...list1];

    for (let expr of list2) {
        if (!isExprIncluded(list1, expr)) {
            newList.push(expr);
        }
    }

    return newList;
}

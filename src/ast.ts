
import { areExprsIdentical } from './areExprsIdentical';
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
// e.g. Flavor.Implies for `or(not("a"), "b")` will use implies-related
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

export function isExprIncluded(array: AstExpr[], isolated: AstExpr): boolean {
    return whereExprIncluded(array, isolated) !== null;
}

export function whereExprIncluded(array: AstExpr[], isolated: AstExpr): number | null {
    for (let i = 0; i < array.length; i++) {
        if (areExprsIdentical(array[i], isolated)) {
            return i;
        }
    }

    return null;
}

export function mergeExprLists(firstList: AstExpr[], ...lists: AstExpr[][]): AstExpr[] {
    let newList = [...firstList];

    for (let list of lists) {
        for (let expr of list) {
            if (!isExprIncluded(newList, expr)) {
                newList.push(expr);
            }
        }
    }

    return newList;
}

export function dedupeExprList(list: AstExpr[]): AstExpr[] {
    return mergeExprLists([], list);
}

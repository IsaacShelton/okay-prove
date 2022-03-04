
import { AstBinaryExpr, AstExpr, AstExprKind, AstNotExpr, AstSelectExpr, AstSymbolExpr } from "./ast";

// NOTE: Does not consider justifications or flavors when determining
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

    throw new Error("areExprsIdentical() cannot compare expr of unrecognized type");
}

export function areExprListsIdentical(aList: AstExpr[], bList: AstExpr[]): boolean {
    if (aList.length != bList.length) return false;

    for (let i = 0; i < aList.length; i++) {
        if (!areExprsIdentical(aList[i], bList[i])) return false;
    }

    return true;
}

export function areExprListsIdenticalUnordered(aUnorderedList: AstExpr[], bUnorderedList: AstExpr[]): boolean {
    if (aUnorderedList.length != bUnorderedList.length) return false;

    let aList = aUnorderedList;
    let bList = [...bUnorderedList];

    for (let i = 0; i < aList.length; i++) {
        let found = false;

        for (let j = 0; j < bList.length; j++) {
            if (areExprsIdentical(aList[i], bList[j])) {
                found = true;
                bList = [...bList.slice(0, j), ...bList.slice(j + 1)];
                break;
            }
        }

        if (!found) {
            return false;
        }
    }

    return true;
}


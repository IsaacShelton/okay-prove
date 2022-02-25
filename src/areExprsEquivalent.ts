
import { areExprsIdentical } from "./areExprsIdentical";
import { AstBinaryExpr, AstExpr, AstExprKind, AstNotExpr, AstSelectExpr } from "./ast";
import { binaryExpr, not, selectExpr, symbol } from "./astExprMaker";
import { canAssociative } from "./canAssociative";
import { canCommutative } from "./canCommutative";
import { canDeMorgans } from "./canDeMorgans";
import { canDoubleNegateTowards } from "./canDoubleNegate";

export function areExprsEquivalent(from: AstExpr, to: AstExpr, maxRecursion: number = 5): AstExpr | null {
    if (areExprsIdentical(from, to)) return from;

    // Don't do further testing if too deep
    if (maxRecursion <= 0) return null;

    function trial(from: AstExpr | null, to: AstExpr, maxRecursion: number) {
        return from ? areExprsEquivalent(from, to, maxRecursion - 1) : null;
    }

    return trial(canCommutative(from, to), to, maxRecursion)
        ?? trial(canAssociative(from, to), to, maxRecursion)
        ?? trial(canDeMorgans(from), to, maxRecursion)
        ?? trial(canDoubleNegateTowards(from, to), to, maxRecursion)
        ?? canUnwrapNegations(from, to, maxRecursion)
        ?? areExprsEquivalentByParts(from, to);
}

export function areExprsEquivalentByParts(from: AstExpr, to: AstExpr, maxRecursion: number = 5): AstExpr | null {
    if (from.type !== to.type) return null;

    switch (from.type) {
        case AstExprKind.Symbol:
            return areExprsIdentical(from, to) ? from : null;
        case AstExprKind.Not: {
            let innerStretch = areExprsEquivalent(from.child, (to as AstNotExpr).child, maxRecursion - 1);
            return innerStretch ? not(innerStretch) : null;
        }
        case AstExprKind.And:
        case AstExprKind.Or:
        case AstExprKind.Implies: {
            let aStretch = areExprsEquivalent(from.a, (to as AstBinaryExpr).a, maxRecursion - 1);
            let bStretch = areExprsEquivalent(from.b, (to as AstBinaryExpr).b, maxRecursion - 1);
            return aStretch && bStretch ? binaryExpr(from.type, aStretch, bStretch, from.flavor) : null;
        }
        case AstExprKind.Any:
        case AstExprKind.All: {
            let fromSelect = from;
            let toSelect = to as AstSelectExpr;

            let children = areExprListsEquivalentUnordered(fromSelect.children, toSelect.children);

            if (children) {
                return selectExpr(from.type, ...children);
            } else {
                return null;
            }
        }
        case AstExprKind.Contradiction:
        case AstExprKind.Tautology:
            return from;
    }

    throw new Error("areExprsIdentical() cannot compare expr of unrecognized type");
}

export function canUnwrapNegations(fromExpr: AstExpr, toExpr: AstExpr, maxRecursion: number): AstExpr | null {
    let [from, to, numOuterNegations] = unwrapCommonOuterNegations(fromExpr, toExpr);

    return rewrapOuterNegations(
        areExprsEquivalent(from, to, maxRecursion - 1),
        numOuterNegations
    );
}

export function unwrapCommonOuterNegations(a: AstExpr, b: AstExpr): [AstExpr, AstExpr, number] {
    let numNegations = 0;

    while (a.type == AstExprKind.Not && b.type == AstExprKind.Not) {
        a = a.child;
        b = b.child;
        numNegations++;
    }

    return [a, b, numNegations];
}

export function rewrapOuterNegations(expr: AstExpr | null, count: number): AstExpr | null {
    if (expr == null) return null;

    for (let i = 0; i < count; i++) {
        expr = not(expr);
    }
    return expr;
}

export function areExprListsEquivalentUnordered(aUnorderedList: AstExpr[], bUnorderedList: AstExpr[]): AstExpr[] | null {
    if (aUnorderedList.length != bUnorderedList.length) return null;

    let aList = aUnorderedList;
    let bList = [...bUnorderedList];
    let parts = [];

    for (let i = 0; i < aList.length; i++) {
        let found = false;

        for (let j = 0; j < bList.length; j++) {
            let stretch = areExprsEquivalent(aList[i], bList[j]);

            if (stretch) {
                found = true;
                parts.push(stretch);
                bList = [...bList.slice(0, j), ...bList.slice(j + 1)];
                break;
            }
        }

        if (!found) {
            return null;
        }
    }

    return parts;
}


import { areExprListsIdenticalUnordered, areExprsIdentical } from "./areExprsIdentical";
import { AstBinaryExpr, AstExpr, AstExprKind, AstNotExpr, AstSelectExpr } from "./ast";
import { binaryExpr, not, selectExpr, symbol } from "./astExprMaker";
import { canAssociative } from "./canAssociative";
import { canCommutative } from "./canCommutative";
import { canDeMorgans } from "./canDeMorgans";
import { canDoubleNegateTowards } from "./canDoubleNegate";
import { byAssociative } from "./justification";
import { justifyInsideBinaryExpr, justifyInsideNotExpr, justifyInsideSelectExpr } from "./justifyInside";
import { logProof } from "./log";

export function areExprsEquivalent(from: AstExpr, to: AstExpr, maxRecursion: number = 5): AstExpr | null {
    if (areExprsIdentical(from, to)) return from;

    // Don't do further testing if too deep
    if (maxRecursion <= 0) return null;

    function trial(from: AstExpr | null, to: AstExpr, maxRecursion: number) {
        return from ? areExprsEquivalent(from, to, maxRecursion - 1) : null;
    }

    return trial(canCommutative(from, to), to, maxRecursion)
        ?? trial(canAssociative(from, to), to, maxRecursion)
        ?? trial(canDoubleNegateTowards(from, to), to, maxRecursion)
        ?? areExprsEquivalentByParts(from, to)
        ?? canUnwrapNegations(from, to, maxRecursion)
        ?? trial(canDeMorgans(from), to, maxRecursion);
}

export function areExprsEquivalentByParts(from: AstExpr, to: AstExpr, maxRecursion: number = 5): AstExpr | null {
    if (from.type !== to.type) return null;

    switch (from.type) {
        case AstExprKind.Symbol:
            return areExprsIdentical(from, to) ? from : null;
        case AstExprKind.Not: {
            let innerStretch = areExprsEquivalent(from.child, (to as AstNotExpr).child, maxRecursion - 1);

            if (innerStretch != null) {
                let stretch = not(innerStretch);
                stretch = justifyInsideNotExpr(innerStretch, from, from.child, stretch as AstNotExpr);
                return stretch;
            } else {
                return null;
            }
        }
        case AstExprKind.And:
        case AstExprKind.Or:
        case AstExprKind.Implies:
            return areBinaryExprsEquivalentUnordered(from, to);
        case AstExprKind.Any:
        case AstExprKind.All:
            return areSelectExprsEquivalentUnordered(from, to);
        case AstExprKind.Contradiction:
        case AstExprKind.Tautology:
            return from;
    }

    throw new Error("areExprsEquivalentByParts() cannot compare expr of unrecognized type");
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

export function areBinaryExprsEquivalentUnordered(from: AstExpr, to: AstExpr): AstExpr | null {
    if (from.type != AstExprKind.And && from.type != AstExprKind.Or) return null;
    if (to.type != AstExprKind.And && to.type != AstExprKind.Or) return null;

    let aStretch, bStretch;

    aStretch = areExprsEquivalent(from.a, (to as AstBinaryExpr).a);
    bStretch = areExprsEquivalent(from.b, (to as AstBinaryExpr).b);

    if (aStretch && bStretch) {
        let stretch = binaryExpr(from.type, aStretch, bStretch, from.flavor);
        stretch = justifyInsideBinaryExpr(aStretch, from, from.a, stretch as AstBinaryExpr, 0);
        stretch = justifyInsideBinaryExpr(bStretch, from, from.b, stretch as AstBinaryExpr, 1);
        return stretch;
    }

    aStretch = areExprsEquivalent(from.b, (to as AstBinaryExpr).a);
    bStretch = areExprsEquivalent(from.a, (to as AstBinaryExpr).b);

    if (aStretch && bStretch) {
        let stretch = binaryExpr(from.type, aStretch, bStretch, from.flavor);
        stretch = justifyInsideBinaryExpr(aStretch, from, from.b, stretch as AstBinaryExpr, 0);
        stretch = justifyInsideBinaryExpr(bStretch, from, from.a, stretch as AstBinaryExpr, 1);
        return stretch;
    }

    return null;
}

export function areSelectExprsEquivalentUnordered(from: AstExpr, to: AstExpr): AstExpr | null {
    if (from.type != AstExprKind.Any && from.type != AstExprKind.All) return null;
    if (to.type != AstExprKind.Any && to.type != AstExprKind.All) return null;

    let fromSelect = from as AstSelectExpr;
    let toSelect = to as AstSelectExpr;

    let equivalence = areExprListsEquivalentUnordered(fromSelect.children, toSelect.children);
    if (equivalence == null) return null;

    let [children, childrenOrder] = equivalence;

    let stretch = selectExpr(from.type, ...children);

    if (childrenOrder) {
        for (let i = 0; i < childrenOrder.length; i++) {
            let stretchChild = children[i];
            let originalChild = from.children[childrenOrder[i]];
            stretch = justifyInsideSelectExpr(stretchChild, from, originalChild, stretch as AstSelectExpr, i);
        }
    }

    return stretch;
}

export function areExprListsEquivalentUnordered(aUnorderedList: AstExpr[], bUnorderedList: AstExpr[]): [AstExpr[], number[] | null] | null {
    // Sees whether the AST expressions in two lists are equivalent (disregarding order)
    // If so, the justified elements and their indices in the first list are returned
    // Otherwise null is returned

    if (aUnorderedList.length != bUnorderedList.length) return null;
    if (areExprListsIdenticalUnordered(aUnorderedList, bUnorderedList)) return [bUnorderedList, null];

    let aList = aUnorderedList;
    let bList = [...bUnorderedList];
    let ordering = [];
    let parts = [];

    for (let i = 0; i < aList.length; i++) {
        let found = false;

        for (let j = 0; j < bList.length; j++) {
            let stretch = areExprsEquivalent(aList[i], bList[j]);

            if (stretch) {
                found = true;
                parts.push(stretch);
                ordering.push(i);
                bList = [...bList.slice(0, j), ...bList.slice(j + 1)];
                break;
            }
        }

        if (!found) {
            return null;
        }
    }

    return [parts, ordering];
}

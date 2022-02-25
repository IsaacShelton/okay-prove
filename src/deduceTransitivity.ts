
import { areExprsIdentical } from "./areExprsIdentical";
import { AstExpr, AstExprKind, mergeExprLists } from "./ast";
import { makeDisjunction } from "./astExprMaker";
import { byTransitivity } from "./justification";
import { opposite } from "./opposite";

export function deduceTransitivity(facts: AstExpr[]): AstExpr[] {
    // (not p or q) and (not q or r)      ->   (not p or r)
    // (q or not p) and (not q or r)      ->   (not p or r)
    // (q or not p) and (r or not q)      ->   (not p or r)
    // (not p or q) and (r or not q)      ->   (not p or r)
    // (p or ...1)  and (not p or ...2)   ->   (...1 or ...2)

    return facts.flatMap((child) => deduceTransitivityFor(child, facts));
}

export function deduceTransitivityFor(expr: AstExpr, facts: AstExpr[]): AstExpr[] {
    let disjunctionChildren = getChildrenOfDisjunction(expr);

    // Only applies to disjunctions
    if (disjunctionChildren == null) return [];

    // So we don't have to use '!!'
    let children = disjunctionChildren;

    return facts.flatMap((fact) => {
        let factChildren = getChildrenOfDisjunction(fact);

        // Only applies to two disjunctions together
        if (factChildren != null) {
            return tryTransitivityForDisjunction(expr, fact, children, factChildren);
        } else {
            return [];
        }
    });
}

function tryTransitivityForDisjunction(aRef: AstExpr, bRef: AstExpr, aChildren: AstExpr[], bChildren: AstExpr[]): AstExpr[] {
    for (let i = 0; i < aChildren.length; i++) {
        for (let j = 0; j < bChildren.length; j++) {
            if (areExprsIdentical(aChildren[i], opposite(bChildren[j]))) {
                let aChildrenWithout = [...aChildren.slice(0, i), ...aChildren.slice(i + 1)];
                let bChildrenWithout = [...bChildren.slice(0, j), ...bChildren.slice(j + 1)];
                return [
                    byTransitivity(makeDisjunction([...aChildrenWithout, ...bChildrenWithout]), aRef, bRef)
                ];
            }
        }
    }

    return [];
}

function getChildrenOfDisjunction(expr: AstExpr): AstExpr[] | null {
    switch (expr.type) {
        case AstExprKind.Or:
            return [expr.a, expr.b];
        case AstExprKind.Any:
            return expr.children;
        default:
            return null;
    }
}

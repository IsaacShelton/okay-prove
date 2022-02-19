
import { assert } from "console";
import { deepCopy } from "deep-copy-ts";
import { areExprsIdentical, AstBinaryExpr, AstExpr, AstExprKind, Flavor } from "./ast";
import { binaryExpr } from "./astExprMaker";
import { areExprsEquivalent } from "./canConclude";
import { byDistributive, justifyUnsafe } from "./justification";
import { Reasoning } from "./reasoning";

export function deduceDistribution(fact: AstExpr): AstExpr[] {
    // (p and q) or  (p and r)    ->    p and (q or r)
    // (p or  q) and (p or r)     ->    p or  (q and r)

    // Only operates on 'and' and 'or' expressions
    if (fact.type != AstExprKind.Or && fact.type != AstExprKind.And) return [];

    let innerType = switchAndOr(fact.type);

    // Only applies if the two sub-expressions are of opposite 'and/or'-ness
    if (fact.a.type != innerType || fact.b.type != innerType) return [];

    let aChildren = [fact.a.a, fact.a.b];
    let bChildren = [fact.b.a, fact.b.b];

    for (let aIndex = 0; aIndex < aChildren.length; aIndex++) {
        let aChild = aChildren[aIndex];

        for (let bIndex = 0; bIndex < bChildren.length; bIndex++) {
            let bChild = bChildren[bIndex];
            let stretch = areExprsEquivalent(bChild, aChild);

            if (stretch && (bIndex == 0 || bIndex == 1)) {
                let preArrangement = justifyRearrangementInsideBinaryExpr(stretch, fact, bChild, fact.b, bIndex);

                // Justify commutativity of terms
                if (aIndex != bIndex) {
                    preArrangement = justifyUnsafe(preArrangement, Reasoning.Commutative, deepCopy(preArrangement));

                    // Switch the one that will allow both to be on the left side
                    if (aIndex == 0) {
                        swapSides((preArrangement as AstBinaryExpr).b as AstBinaryExpr);
                    } else {
                        swapSides((preArrangement as AstBinaryExpr).a as AstBinaryExpr);
                    }
                }

                let remainingAChild = aChildren[(aIndex + 1) % 2];
                let remainingBChild = bChildren[(bIndex + 1) % 2];
                return [
                    byDistributive(
                        binaryExpr(innerType, stretch, binaryExpr(fact.type, remainingAChild, remainingBChild, Flavor.Naked), Flavor.Naked),
                        preArrangement
                    )
                ];
            }
        }
    }

    return [];
}

function swapSides(expr: AstBinaryExpr) {
    let tmp = expr.a;
    expr.a = expr.b;
    expr.b = tmp;
}

// Does black magic in order to justify in-place modifications of a sub-expression that's inside a binary expression
function justifyRearrangementInsideBinaryExpr(justifiedSubExpr: AstExpr, originalParentExpr: AstExpr, subExpr: AstExpr, owner: AstBinaryExpr, side: 0 | 1): AstExpr {
    let running = justifiedSubExpr;
    let parent: AstExpr = originalParentExpr;

    if (areExprsIdentical(running, subExpr)) {
        return parent;
    }

    while (running.justification) {
        parent = justifyUnsafe(parent, running.justification.reasoning, deepCopy(parent));

        if (side == 0) {
            owner.a = running;
        } else {
            owner.b = running;
        }

        assert(running.justification.references.length >= 1);
        running = running.justification.references[0];

        if (areExprsIdentical(running, subExpr)) {
            return parent;
        }
    }

    throw new Error("justifyRearrangementInsideBinaryExpr() could not justify");
}

function switchAndOr(type: AstExprKind.And | AstExprKind.Or): AstExprKind.And | AstExprKind.Or {
    switch (type) {
        case AstExprKind.And:
            return AstExprKind.Or;
        case AstExprKind.Or:
            return AstExprKind.And;
        default:
            throw new Error("switchAndOr() got expression kind that's not 'and' or 'or'");
    }
}

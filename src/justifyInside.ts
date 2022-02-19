
import assert from "assert";
import { deepCopy } from "deep-copy-ts";
import { areExprsIdentical, AstBinaryExpr, AstExpr, AstSelectExpr } from "./ast";
import { justifyUnsafe } from "./justification";

// Does "black magic" in order to justify in-place modifications of a sub-expression that's inside a binary expression
export function justifyInsideBinaryExpr(justifiedSubExpr: AstExpr, originalParentExpr: AstExpr, subExpr: AstExpr, owner: AstBinaryExpr, side: 0 | 1): AstExpr {
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

    throw new Error("justifyInsideBinaryExpr() could not justify");
}

// Does "black magic" in order to justify in-place modifications of a sub-expression that's inside a select expression
export function justifyInsideSelectExpr(justifiedSubExpr: AstExpr, originalParentExpr: AstExpr, subExpr: AstExpr, owner: AstSelectExpr, index: number): AstExpr {
    let running = justifiedSubExpr;
    let parent: AstExpr = originalParentExpr;

    if (areExprsIdentical(running, subExpr)) {
        return parent;
    }

    while (running.justification) {
        parent = justifyUnsafe(parent, running.justification.reasoning, deepCopy(parent));
        owner.children[index] = running;

        assert(running.justification.references.length >= 1);
        running = running.justification.references[0];

        if (areExprsIdentical(running, subExpr)) {
            return parent;
        }
    }

    throw new Error("justifyInsideSelect() could not justify");
}

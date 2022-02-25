
import { AstExpr, AstExprKind } from "./ast";
import { areExprsEquivalent } from "./areExprsEquivalent";
import { byDoubleNegation } from "./justification";
import { not } from "./astExprMaker";

export function canDoubleNegate(from: AstExpr, to: AstExpr): AstExpr | null {
    return canDoubleNegateForward(from, to)
        ?? canDoubleNegateBackwards(from, to);
}

export function canDoubleNegateForward(from: AstExpr, to: AstExpr): AstExpr | null {
    if (to.type !== AstExprKind.Not) return null;
    if (to.child.type !== AstExprKind.Not) return null;

    let stretch = areExprsEquivalent(from, to.child.child);

    if (stretch) {
        return byDoubleNegation(stretch, from);
    } else {
        return null;
    }
}

export function canDoubleNegateBackwards(from: AstExpr, to: AstExpr): AstExpr | null {
    if (from.type !== AstExprKind.Not) return null;
    if (from.child.type !== AstExprKind.Not) return null;

    let stretch = areExprsEquivalent(from.child.child, to);

    if (stretch) {
        return byDoubleNegation(stretch, from);
    } else {
        return null;
    }
}

export function canDoubleNegateTowards(from: AstExpr, to: AstExpr): AstExpr | null {
    if (to.type === AstExprKind.Not && to.child.type === AstExprKind.Not) {
        let stretch = areExprsEquivalent(from, to.child.child);

        if (stretch) {
            return byDoubleNegation(not(not(stretch)), from);
        } else {
            return null;
        }
    }

    return canDoubleNegateBackwards(from, to);
}

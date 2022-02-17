
import { AstExpr, AstExprKind } from "./ast";
import { and, not, or } from "./astExprMaker";
import { byDeMorgans, byDoubleNegation } from "./justification";

export function canDeMorgans(from: AstExpr): AstExpr | null {
    return canDeMorgansForward(from)
        ?? canDeMorgansBackwards(from)
        ?? canDeMorgansForward(doubleNegate(from))
}

export function canDeMorgansForward(from: AstExpr): AstExpr | null {
    // not (a or b) -> (not a) and (not b)
    // not (a and b) -> (not a) or (not b)

    // We can only perform it (forwards at least) if their is a 'not' around it
    if (from.type !== AstExprKind.Not) return null;

    let inner = from.child;

    // We can only perform it if the inner expression is an 'and' or an 'or'
    if (inner.type !== AstExprKind.Or && inner.type !== AstExprKind.And) {
        return null;
    }

    // Perform switch and negate
    switch (inner.type) {
        case AstExprKind.And:
            return byDeMorgans(or(not(inner.a), not(inner.b)), from);
        case AstExprKind.Or:
            return byDeMorgans(and(not(inner.a), not(inner.b)), from);
        default:
            return null;
    }
}

export function canDeMorgansBackwards(from: AstExpr): AstExpr | null {
    // (not a) and (not b) -> not (a or b) 
    // (not a) or (not b) -> not (a and b) 

    // We can only perform it if the expression is an 'and' or an 'or'
    if (from.type !== AstExprKind.Or && from.type !== AstExprKind.And) {
        return null;
    }

    // We can only perform it (backwards at least) if their is a 'not' around the inner parts
    if (from.a.type !== AstExprKind.Not) return null;
    if (from.b.type !== AstExprKind.Not) return null;

    // Perform switch and negate
    switch (from.type) {
        case AstExprKind.And:
            return byDeMorgans(not(or(from.a.child, from.b.child)), from);
        case AstExprKind.Or:
            return byDeMorgans(not(and(from.a.child, from.b.child)), from);
        default:
            return null;
    }
}

function doubleNegate(expr: AstExpr): AstExpr {
    return byDoubleNegation(not(not(expr)), expr);
}


import { areExprListsIdentical, areExprListsIdenticalUnordered, AstExpr, AstExprKind } from "./ast";
import { byAssociative } from "./justification";

export function canAssociative(from: AstExpr, to: AstExpr): AstExpr | null {
    // (a or b) or c             ->   a or (b or c)
    // (a or b) or c             ->   a or (c or b) (+commutative)
    // d or ((a or b) or c)      ->   (d or a) or (b or c)
    // d or ((a or b) or c)      ->   (a or d) or (c or b) (+commutative)
    // (a and b) and c           ->   a and (b and c)
    // (a and b) and c           ->   a and (c and b) (+commutative)
    // d and ((a and b) and c)   ->   (d and a) and (b and c)
    // d and ((a and b) and c)   ->   (a and d) and (c and b) (+commutative)

    if (!areCompatibleForAssociative(from, to)) {
        return null;
    }

    let fromChildren = getOffspring(from);
    let toChildren = getOffspring(to);

    if (fromChildren.length == 0 || toChildren.length == 0) {
        return null;
    }

    if (areExprListsIdentical(fromChildren, toChildren)) {
        return byAssociative(to, from);
    }

    if (areExprListsIdenticalUnordered(fromChildren, toChildren)) {
        // TODO: Include justification for any commutative operations
        return byAssociative(to, from);
    }

    return null;
}

function areCompatibleForAssociative(a: AstExpr, b: AstExpr): boolean {
    switch (a.type) {
        case AstExprKind.And:
            return b.type == AstExprKind.And || b.type == AstExprKind.All;
        case AstExprKind.All:
            return b.type == AstExprKind.And || b.type == AstExprKind.All;
        case AstExprKind.Or:
            return b.type == AstExprKind.Or || b.type == AstExprKind.Any;
        case AstExprKind.Any:
            return b.type == AstExprKind.Or || b.type == AstExprKind.Any;
        default:
            return false;
    }
}

export function getOffspring(expr: AstExpr): AstExpr[] {
    switch (expr.type) {
        case AstExprKind.Or:
        case AstExprKind.And:
            return reduceCompoundJunction(expr, expr.type);
        case AstExprKind.Any:
        case AstExprKind.All:
            return expr.children;
        default:
            return [];
    }
}

export function isCompoundJunction(expr: AstExpr): boolean {
    if (expr.type == AstExprKind.Or || expr.type == AstExprKind.And) {
        return expr.a.type == expr.type || expr.b.type == expr.type;
    } else {
        return false;
    }
}

export function reduceCompoundJunction(expr: AstExpr, kind: AstExprKind): AstExpr[] {
    if (kind != AstExprKind.And && kind != AstExprKind.Or) {
        return [];
    }

    switch (expr.type) {
        case kind:
            return [...reduceCompoundJunction(expr.a, kind), ...reduceCompoundJunction(expr.b, kind)];
        default:
            return [expr];
    }
}


import { AstExpr, AstExprKind } from "./ast";

export function isCompoundOr(expr: AstExpr): boolean {
    if (expr.type == AstExprKind.Or) {
        return expr.a.type == AstExprKind.Or || expr.b.type == AstExprKind.Or;
    } else {
        return false;
    }
}

export function reduceCompoundOr(expr: AstExpr): AstExpr[] {
    switch (expr.type) {
        case AstExprKind.Or:
            return [...reduceCompoundOr(expr.a), ...reduceCompoundOr(expr.b)];
        default:
            return [expr];
    }
}

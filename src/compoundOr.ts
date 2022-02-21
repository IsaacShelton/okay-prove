
import { AstExpr, AstExprKind } from "./ast";
import { reduceCompoundJunction } from "./canAssociative";

export function isCompoundOr(expr: AstExpr): boolean {
    if (expr.type == AstExprKind.Or) {
        return expr.a.type == AstExprKind.Or || expr.b.type == AstExprKind.Or;
    } else {
        return false;
    }
}

export function reduceCompoundOr(expr: AstExpr): AstExpr[] {
    return reduceCompoundJunction(expr, AstExprKind.Or);
}

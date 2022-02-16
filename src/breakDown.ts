
import { AstExpr, AstExprKind, mergeExprLists } from './ast';
import { bySpecialization } from './justification';

export function breakDown(exprs: AstExpr[]): AstExpr[] {
    return mergeExprLists(
        exprs,
        exprs.flatMap(breakApart)
    );
}

function breakApart(expr: AstExpr): AstExpr[] {
    switch (expr.type) {
        case AstExprKind.And:
            return [
                bySpecialization(expr.a, expr),
                bySpecialization(expr.b, expr)
            ];
        case AstExprKind.All:
            return expr.children.map((child) => bySpecialization(child, expr))
        default:
            return [];
    }
}

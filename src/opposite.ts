
import { AstExpr, AstExprKind } from './ast';
import { not } from './astExprMaker';

export function opposite(expr: AstExpr): AstExpr {
    if (expr.type == AstExprKind.Not) {
        return expr.child;
    } else {
        return not(expr);
    }
}

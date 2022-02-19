
import { AstExpr } from './ast';
import { removeImplies } from './removeImplies';

export function initialSimplify(expr: AstExpr): AstExpr {
    return removeImplies(expr);
}


import { AstExpr, AstExprKind } from './ast';
import { all, and, any, not, or } from './astExprMaker';
import { isCompoundOr, reduceCompoundOr } from './compoundOr';
import { removeImplies } from './simplify';

export function simplifyConclusion(conclusion: AstExpr): AstExpr {
    switch (conclusion.type) {
        case AstExprKind.Symbol:
        case AstExprKind.Tautology:
        case AstExprKind.Contradiction:
            return conclusion;
        case AstExprKind.All:
            return all(...conclusion.children.map(simplifyConclusion));
        case AstExprKind.Any:
            return any(...conclusion.children.map(simplifyConclusion));
        case AstExprKind.Not:
            return not(simplifyConclusion(conclusion.child));
        case AstExprKind.And:
            return and(simplifyConclusion(conclusion.a), simplifyConclusion(conclusion.b));
        case AstExprKind.Or:
            if (isCompoundOr(conclusion)) {
                return simplifyConclusion(any(...reduceCompoundOr(conclusion)));
            } else {
                return or(simplifyConclusion(conclusion.a), simplifyConclusion(conclusion.b));
            }
        case AstExprKind.Implies:
            return simplifyConclusion(removeImplies(conclusion));
    }

    throw new Error("simplifyConclusion() got unrecognized expr kind");
}

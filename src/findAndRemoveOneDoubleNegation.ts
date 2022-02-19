
import { AstExpr, AstExprKind } from "./ast";
import { binaryExpr, selectExpr } from "./astExprMaker";

export function findAndRemoveOneDoubleNegation(expr: AstExpr): AstExpr | null {
    let withRemoved: AstExpr | null;

    switch (expr.type) {
        case AstExprKind.Symbol:
        case AstExprKind.Tautology:
        case AstExprKind.Contradiction:
            return null;
        case AstExprKind.Or:
        case AstExprKind.And:
        case AstExprKind.Implies:
            // (We go backwards so that reading the proof forwards is more human-readable)

            withRemoved = findAndRemoveOneDoubleNegation(expr.b);
            if (withRemoved) return binaryExpr(expr.type, expr.a, withRemoved, expr.flavor);

            withRemoved = findAndRemoveOneDoubleNegation(expr.a);
            if (withRemoved) return binaryExpr(expr.type, withRemoved, expr.b, expr.flavor);

            break;
        case AstExprKind.Any:
        case AstExprKind.All:
            // (We go backwards so that reading the proof forwards is more human-readable)
            for (let i = expr.children.length - 1; i >= 0; i--) {
                let child = expr.children[i];
                let withRemoved = findAndRemoveOneDoubleNegation(child);

                if (withRemoved) {
                    return selectExpr(expr.type, ...expr.children.slice(0, i), withRemoved, ...expr.children.slice(i + 1));
                }
            }
            break;
        case AstExprKind.Not:
            if (expr.child.type == AstExprKind.Not) {
                return expr.child.child;
            }
            break;
    }

    return null;
}

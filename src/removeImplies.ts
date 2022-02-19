
import { AstExpr, AstExprKind } from "./ast";
import { binaryExpr, not, reducedImplies, selectExpr } from "./astExprMaker";
import { byDefinitionOfImplies } from "./justification";

export function removeImplies(expr: AstExpr): AstExpr {
    while (true) {
        let newExpr = findAndRemoveOneImplies(expr);

        if (newExpr) {
            expr = byDefinitionOfImplies(newExpr, expr);
        } else {
            break;
        }
    }

    return expr;
}

function findAndRemoveOneImplies(expr: AstExpr): AstExpr | null {
    let withRemoved;

    switch (expr.type) {
        case AstExprKind.Symbol:
        case AstExprKind.Tautology:
        case AstExprKind.Contradiction:
            return null;
        case AstExprKind.Not:
            withRemoved = findAndRemoveOneImplies(expr.child);
            if (withRemoved) return not(withRemoved);

            return null;
        case AstExprKind.Or:
        case AstExprKind.And:
            withRemoved = findAndRemoveOneImplies(expr.a);
            if (withRemoved) return binaryExpr(expr.type, withRemoved, expr.b, expr.flavor);

            withRemoved = findAndRemoveOneImplies(expr.b);
            if (withRemoved) return binaryExpr(expr.type, expr.a, withRemoved, expr.flavor);

            return null;
        case AstExprKind.Any:
        case AstExprKind.All:
            for (let i = 0; i < expr.children.length; i++) {
                let child = expr.children[i];
                let withRemoved = findAndRemoveOneImplies(child);

                if (withRemoved) {
                    return selectExpr(expr.type, ...expr.children.slice(0, i), withRemoved, ...expr.children.slice(i + 1));
                }
            }

            return null;
        case AstExprKind.Implies:
            // (We go backwards so that reading the proof forwards is more human-readable)

            withRemoved = findAndRemoveOneImplies(expr.a);
            if (withRemoved) return binaryExpr(expr.type, withRemoved, expr.b, expr.flavor);

            withRemoved = findAndRemoveOneImplies(expr.b);
            if (withRemoved) return binaryExpr(expr.type, expr.a, withRemoved, expr.flavor);

            return reducedImplies(removeImplies(expr.a), removeImplies(expr.b));
    }

    throw new Error("findAndRemoveOneImplies() got unrecognized AstExprKind");
}

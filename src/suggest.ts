import { AstExpr, AstExprKind, dedupe as dedupeExprList } from "./ast";
import { deduce } from "./deduce";
import { opposite } from "./opposite";

export function suggest(facts: AstExpr[], goal: AstExpr): AstExpr[] {
    let pieces = intoPieces(goal)

    let containers = facts
        .flatMap((fact) => intoPieces(fact))
        .flatMap((thing) => [thing, opposite(thing)])
        .flatMap((thing) => deduce([thing]));

    return dedupeExprList([...pieces, ...containers]);
}

function intoPieces(expr: AstExpr): AstExpr[] {
    switch (expr.type) {
        case AstExprKind.Symbol:
            return [expr];
        case AstExprKind.Tautology:
        case AstExprKind.Contradiction:
            return [];
        case AstExprKind.And:
        case AstExprKind.Or:
        case AstExprKind.Implies:
            return [expr, ...intoPieces(expr.a), ...intoPieces(expr.b)];
        case AstExprKind.Any:
        case AstExprKind.All:
            return [expr, ...expr.children.flatMap(intoPieces)];
        case AstExprKind.Not:
            return [expr, ...intoPieces(expr.child)];
    }

    throw new Error("intoPieces() got unrecognized expr kind");
}

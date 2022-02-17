
import { AstExpr, AstExprKind } from "./ast";
import { Justification, reasoningName } from "./justification";

export function visualizeProof(expr: AstExpr, depth: number = 0): string {
    let result = " ".repeat(depth) + visualizeExpr(expr);

    if (expr.justification) {
        result += visualizeJustification(expr.justification);

        for (let reference of expr.justification.references) {
            result = visualizeProof(reference, depth + 1) + "\n" + result;
        }
    }

    return result;
}

export function visualizeExpr(expr: AstExpr): string {
    switch (expr.type) {
        case AstExprKind.Symbol:
            return expr.name;
        case AstExprKind.Contradiction:
            return "!";
        case AstExprKind.Tautology:
            return ".";
        case AstExprKind.Not:
            return "not " + nest(expr.child);
        case AstExprKind.And:
            return nest(expr.a) + " and " + nest(expr.b);
        case AstExprKind.Or:
            return nest(expr.a) + " or " + nest(expr.b);
        case AstExprKind.All:
            return expr.children.map(nest).join(" and ");
        case AstExprKind.Any:
            return expr.children.map(nest).join(" or ");
        case AstExprKind.Implies:
            return nest(expr.a) + " implies " + nest(expr.b);
    }

    throw new Error("visualizeExpr() got unrecognized expr kind");
}

function nest(expr: AstExpr): string {
    if (canNest(expr)) {
        return "(" + visualizeExpr(expr) + ")";
    } else {
        return visualizeExpr(expr);
    }
}

function canNest(expr: AstExpr) {
    switch (expr.type) {
        case AstExprKind.Symbol:
        case AstExprKind.Contradiction:
        case AstExprKind.Tautology:
        case AstExprKind.Not:
            return false;
        default:
            return true;
    }
}

function visualizeJustification(justification: Justification) {
    return " [" + reasoningName(justification.reasoning) + "]";
}

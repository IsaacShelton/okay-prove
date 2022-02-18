
import { AstExpr, AstExprKind } from "./ast";
import { Justification, reasoningName } from "./justification";

export function logProof(expr: AstExpr) {
    console.log(visualizeProof(expr));
}

export function visualizeProof(expr: AstExpr, depth: number = 0): string {
    let result = " ".repeat(depth) + visualizeExpr(expr);

    if (expr.justification) {
        result += visualizeJustification(expr.justification);

        for (let reference of expr.justification.references) {
            result = visualizeProof(reference, depth + 1) + "\n" + result;
        }
    }

    return depth == 0 ? reverseIndentation(result) : result;
}

function reverseIndentation(contents: string): string {
    let lines = contents.split(/\r?\n/);
    let maxIndentation = lines.reduce((maxIndentation, line) => Math.max(maxIndentation, line.search(/\S|$/)), 0);

    return lines.map((line) => {
        let indentation = line.search(/\S|$/);
        try {
            return " ".repeat(maxIndentation - indentation) + line.slice(indentation);
        } catch (e: any) {
            console.log(indentation);
            throw e;
        }
    }).join("\n");
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

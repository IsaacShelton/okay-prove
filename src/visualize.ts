
import { AstExpr, AstExprKind } from "./ast";
import { Reasoning, reasoningName } from "./reasoning";
import { visualizeProofCascade } from "./visualizeProofCascade";
import { visualizeProofInline } from "./visualizeProofInline";
import { visualizeProofLatex } from "./visualizeProofLatex";

export function visualizeProof(expr: AstExpr, format: 'cascade' | 'inline' | 'latex' | 'collapse'): string {
    switch (format) {
        case 'cascade':
            return visualizeProofCascade(expr);
        case 'inline':
            return visualizeProofInline(expr);
        case 'latex':
            return visualizeProofLatex(expr);
        case 'collapse':
            return visualizeProofCascade(expr, 0, false);
    }
}

export function visualizeExpr(expr: AstExpr): string {
    let nest = nestRegular;

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

export function visualizeExprLatex(expr: AstExpr): string {
    let nest = nestLatex;

    switch (expr.type) {
        case AstExprKind.Symbol:
            return expr.name;
        case AstExprKind.Contradiction:
            return "\\mathbb{c}";
        case AstExprKind.Tautology:
            return "\\mathbb{t}";
        case AstExprKind.Not:
            return "\\lnot " + nest(expr.child);
        case AstExprKind.And:
            return nest(expr.a) + " \\land " + nest(expr.b);
        case AstExprKind.Or:
            return nest(expr.a) + " \\lor " + nest(expr.b);
        case AstExprKind.All:
            return expr.children.map(nest).join(" \\land ");
        case AstExprKind.Any:
            return expr.children.map(nest).join(" \\lor ");
        case AstExprKind.Implies:
            return nest(expr.a) + " \\to " + nest(expr.b);
    }

    throw new Error("visualizeExpr() got unrecognized expr kind");
}

export function nestRegular(expr: AstExpr): string {
    if (canNest(expr)) {
        return "(" + visualizeExpr(expr) + ")";
    } else {
        return visualizeExpr(expr);
    }
}

export function nestLatex(expr: AstExpr): string {
    if (canNest(expr)) {
        return "(" + visualizeExprLatex(expr) + ")";
    } else {
        return visualizeExprLatex(expr);
    }
}

export function canNest(expr: AstExpr) {
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

export function visualizeReasoning(reasoning: Reasoning | null | undefined) {
    if (reasoning != null) {
        return " [" + reasoningName(reasoning) + "]";
    } else {
        return "";
    }
}

export function reverseIndentation(contents: string): string {
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

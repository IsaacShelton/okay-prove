
import { areExprsIdentical, AstBinaryExpr, AstExpr, AstExprKind, AstSelectExpr } from "./ast";
import { any, or } from "./astExprMaker";
import { byAssociative, byElimination } from "./justification";
import { opposite } from "./opposite";

export function deduceElimination(facts: AstExpr[]): AstExpr[] {
    let deductions: AstExpr[] = [];

    for (let fact of facts) {
        switch (fact.type) {
            case AstExprKind.Or:
                deductions.push(...deduceEliminationForOr(fact, facts));
                continue;
            case AstExprKind.Any:
                deductions.push(...deduceEliminationForAny(fact, facts));
                continue;
            default:
                continue;
        }
    }

    return deductions;
}

function deduceEliminationForOr(expr: AstBinaryExpr, facts: AstExpr[]): AstExpr[] {
    let notA = tryFindOpposite(expr.a, facts);
    let notB = tryFindOpposite(expr.b, facts);

    if (notA) {
        return [byElimination(expr.b, expr, notA)];
    } else if (notB) {
        return [byElimination(expr.a, expr, notB)];
    } else {
        return [];
    }
}

function deduceEliminationForAny(expr: AstSelectExpr, facts: AstExpr[]): AstExpr[] {
    if (expr.children.length <= 1) {
        return expr.children.map((child) => byAssociative(child, expr));
    }

    if (expr.children.length == 2) {
        return [
            byAssociative(or(expr.children[0], expr.children[1]), expr)
        ];
    }

    for (let i = 0; i < expr.children.length; i++) {
        let opposition = tryFindOpposite(expr.children[i], facts);

        if (opposition) {
            if (expr.children.length == 3) {
                // Auto-collapse to 'or'
                let remaining = [...expr.children];
                remaining.splice(i, 1);

                return [
                    byElimination(or(remaining[0], remaining[1]), expr, opposition)
                ]
            } else {
                return [
                    byElimination(any(...expr.children.slice(0, i), ...expr.children.slice(i + 1)), expr, opposition)
                ]
            }
        }
    }

    return [];
}

function tryFindOpposite(expr: AstExpr, facts: AstExpr[]): AstExpr | null {
    let oppositeExpr = opposite(expr);

    for (let fact of facts) {
        if (areExprsIdentical(fact, oppositeExpr)) {
            return fact;
        }
    }

    return null;
}

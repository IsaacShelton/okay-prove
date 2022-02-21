
import { AstBinaryExpr, AstExpr, AstExprKind, AstSelectExpr } from "./ast";
import { not } from "./astExprMaker";
import { areExprsEquivalent } from "./canConclude";
import { byNegation } from "./justification";
import { justifyInsideBinaryExpr, justifyInsideSelectExpr } from "./justifyInside";
import { opposite } from "./opposite";

export function deduceNegation(expr: AstExpr): AstExpr[] {
    switch (expr.type) {
        case AstExprKind.Or:
        case AstExprKind.And:
            return deduceNegationForBinaryExpr(expr);
        case AstExprKind.Any:
            return deduceNegationForSelectExpr(expr, AstExprKind.Tautology);
        case AstExprKind.All:
            return deduceNegationForSelectExpr(expr, AstExprKind.Contradiction);
        default:
            return [];
    }
}

function deduceNegationForBinaryExpr(expr: AstBinaryExpr): AstExpr[] {
    // a  or not a            ->   a or not a
    // a and not a            ->   not (a and not a)
    // (a and not a) or  ...  ->   not (a and not a)
    // (a or not a) and ...   ->   a or not a

    // First try to deduce negation for ourself
    let stretch = areExprsEquivalent(expr.b, opposite(expr.a));

    if (stretch) {
        let parent = justifyInsideBinaryExpr(stretch, expr, expr.b, expr, 1);

        let selfDeduction = byNegation(
            expr.type == AstExprKind.And ? not(expr) : expr,
            parent
        );

        return [selfDeduction, ...deduceNegation(expr.a), ...deduceNegation(expr.b)];
    } else {
        return [...deduceNegation(expr.a), ...deduceNegation(expr.b)];
    }
}

function deduceNegationForSelectExpr(
    expr: AstSelectExpr,
    ifSoResultKind: AstExprKind.Tautology | AstExprKind.Contradiction
): AstExpr[] {
    // (a or  b or  c or  d or  not a)   ->   .
    // (a and b and c and d and not a)   ->   !

    let selfDeductions = [];

    for (let i = 0; i < expr.children.length; i++) {
        for (let j = 0; j < i; j++) {
            let stretch = areExprsEquivalent(expr.children[i], opposite(expr.children[j]));

            if (stretch) {
                let parent = justifyInsideSelectExpr(stretch, expr, opposite(expr.children[j]), expr, i);

                let selfDeduction = byNegation(
                    expr.type == AstExprKind.All ? not(expr) : expr,
                    parent
                );

                selfDeductions.push(selfDeduction);
            }
        }
    }

    return [...selfDeductions, ...expr.children.flatMap(deduceNegation)];
}

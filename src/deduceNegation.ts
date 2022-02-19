
import { AstBinaryExpr, AstExpr, AstExprKind, AstSelectExpr } from "./ast";
import { assertion, binaryExpr, contradiction, selectExpr, tautology } from "./astExprMaker";
import { areExprsEquivalent } from "./canConclude";
import { byNegation } from "./justification";
import { justifyInsideBinaryExpr, justifyInsideSelectExpr } from "./justifyInside";
import { opposite } from "./opposite";

export function deduceNegation(expr: AstExpr): AstExpr | null {
    switch (expr.type) {
        case AstExprKind.Or:
        case AstExprKind.And:
            return deduceNegationForBinaryExpr(expr);
        case AstExprKind.Any:
            return deduceNegationForSelectExpr(expr, AstExprKind.Tautology);
        case AstExprKind.All:
            return deduceNegationForSelectExpr(expr, AstExprKind.Contradiction);
        default:
            return null;
    }
}

function deduceNegationForBinaryExpr(expr: AstBinaryExpr): AstExpr | null {
    // a  or not a            ->   .
    // a and not a            ->   !
    // (a and not a) or  ...  ->   ! or ...
    // (a or not a) and ...   ->   . and ...

    // Try to deduce negation for children first

    let aDeduction = deduceNegation(expr.a);
    if (aDeduction !== null) {
        return byNegation(
            binaryExpr(expr.type, aDeduction, expr.b, expr.flavor),
            expr
        );
    }

    let bDeduction = deduceNegation(expr.b);
    if (bDeduction !== null) {
        return byNegation(
            binaryExpr(expr.type, expr.a, bDeduction, expr.flavor),
            expr
        );
    }

    // Otherwise try to deduce negation for ourself
    let stretch = areExprsEquivalent(expr.b, opposite(expr.a));

    if (stretch) {
        let parent = justifyInsideBinaryExpr(stretch, expr, expr.b, expr, 1);

        return byNegation(expr.type == AstExprKind.And ? contradiction() : tautology(), parent);
    } else {
        return null;
    }
}

function deduceNegationForSelectExpr(
    expr: AstSelectExpr,
    ifSoResultKind: AstExprKind.Tautology | AstExprKind.Contradiction
): AstExpr | null {
    // (a or  b or  c or  d or  not a)   ->   .
    // (a and b and c and d and not a)   ->   !

    // Try to deduce negation for children first
    for (let i = 0; i < expr.children.length; i++) {
        let childDeduced = deduceNegation(expr.children[i]);

        if (childDeduced !== null) {
            let newChildren = [...expr.children.slice(0, i), childDeduced, ...expr.children.slice(i)];
            return selectExpr(expr.type, ...newChildren);
        }
    }

    // Otherwise try to deduce negation for ourself
    for (let i = 0; i < expr.children.length; i++) {
        for (let j = 0; j < i; j++) {
            let stretch = areExprsEquivalent(expr.children[i], opposite(expr.children[j]));

            if (stretch) {
                let parent = justifyInsideSelectExpr(stretch, expr, opposite(expr.children[j]), expr, i);
                return byNegation(assertion(ifSoResultKind), parent);
            }
        }
    }

    return null;
}


import { AstBinaryExpr, AstExpr, AstExprKind, AstNotExpr, AstSelectExpr, isExprIncluded, whereExprIncluded } from "./ast";
import { assertion, binaryExpr, contradiction, makeConjunction, makeDisjunction, tautology } from "./astExprMaker";
import { byIdentity, byNegationOfTautology, byUniversalBounds } from "./justification";

export function findAndRemoveOneAssertion(expr: AstExpr): AstExpr | null {
    switch (expr.type) {
        case AstExprKind.Symbol:
        case AstExprKind.Tautology:
        case AstExprKind.Contradiction:
            return null;
        case AstExprKind.Or:
            return findAndRemoveOneAssertionFromJunction(expr, AstExprKind.Contradiction, AstExprKind.Tautology);
        case AstExprKind.And:
            return findAndRemoveOneAssertionFromJunction(expr, AstExprKind.Tautology, AstExprKind.Contradiction);
        case AstExprKind.Implies:
            // (not implemented - will be reduced anyways so we don't need to implement this)
            // TODO: Implement this for better human-readable justifications
            break;
        case AstExprKind.Any:
            return findAndRemoveOneAssertionFromCompoundJunction(expr, AstExprKind.Contradiction, AstExprKind.Tautology, makeDisjunction);
        case AstExprKind.All:
            return findAndRemoveOneAssertionFromCompoundJunction(expr, AstExprKind.Tautology, AstExprKind.Contradiction, makeConjunction);
        case AstExprKind.Not:
            return findAndRemoveOneAssertionFromNot(expr);
    }

    return null;
}

function findAndRemoveOneAssertionFromNot(expr: AstNotExpr): AstExpr | null {
    if (expr.child.type == AstExprKind.Tautology) {
        return byNegationOfTautology(contradiction(), expr);
    }

    if (expr.child.type == AstExprKind.Contradiction) {
        return byNegationOfTautology(tautology(), expr);
    }

    return findAndRemoveOneAssertion(expr.child);
}

function findAndRemoveOneAssertionFromJunction(
    expr: AstBinaryExpr,
    identityKind: AstExprKind.Tautology | AstExprKind.Contradiction,
    universalBoundsKind: AstExprKind.Tautology | AstExprKind.Contradiction
): AstExpr | null {

    // Try to remove assertion from children first
    let reduceA = findAndRemoveOneAssertion(expr.a);
    if (reduceA) return binaryExpr(expr.type, reduceA, expr.b, expr.flavor);

    let reduceB = findAndRemoveOneAssertion(expr.b);
    if (reduceB) return binaryExpr(expr.type, expr.a, reduceB, expr.flavor);

    // Otherwise try to remove from self
    if (expr.a.type == identityKind) return byIdentity(expr.b, expr);
    if (expr.b.type == identityKind) return byIdentity(expr.a, expr);

    if (expr.a.type == universalBoundsKind || expr.b.type == universalBoundsKind) {
        return byUniversalBounds(
            assertion(universalBoundsKind),
            expr
        );
    }

    return null;
}

function findAndRemoveOneAssertionFromCompoundJunction(
    expr: AstSelectExpr,
    identityKind: AstExprKind.Tautology | AstExprKind.Contradiction,
    universalBoundsKind: AstExprKind.Tautology | AstExprKind.Contradiction,
    selectionConstructorFunction: (children: AstExpr[]) => AstExpr,
): AstExpr | null {

    // Try to remove assertion from children first
    for (let i = 0; i < expr.children.length; i++) {
        let reducedChild = findAndRemoveOneAssertion(expr.children[i]);

        if (reducedChild) {
            return selectionConstructorFunction([...expr.children.slice(0, i), ...expr.children.slice(i)]);
        }
    }

    // Otherwise try to remove from self
    let universalAssertion = assertion(universalBoundsKind);
    let identityAssertion = assertion(identityKind);

    if (isExprIncluded(expr.children, universalAssertion)) {
        return byUniversalBounds(universalAssertion, expr);
    }

    let running: AstExpr = expr;

    while (true) {
        if (running.type != AstExprKind.Any) break;

        let where = whereExprIncluded(running.children, identityAssertion);
        if (where === null) break;

        let remaining = [...running.children.slice(0, where), ...running.children.slice(where + 1)];
        running = byIdentity(selectionConstructorFunction(remaining), running);
    }

    return running !== expr ? running : null;
}

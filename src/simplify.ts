
import unimplemented from 'ts-unimplemented';
import { CustomError } from 'ts-custom-error';
import { AstExpr, AstExprKind, areExprsIdentical, Flavor } from './ast';
import { binaryExpr, reducedImplies, selectExpr } from './astExprMaker';
import { byDefinitionOfImplies, justifyUnsafe } from './justification';
import { visualizeExpr } from './visualize';

export class SimplificationError extends CustomError {
    constructor(reason: string) {
        super(reason);
    }
}

export function initialSimplify(expr: AstExpr): AstExpr {
    return removeImplies(expr);
}

export function simplify(initialExpr: AstExpr): AstExpr {
    for (let i = 0; i < 10000; i++) {
        let expr = negationNormalForm(initialExpr);

        if (areExprsIdentical(expr, initialExpr)) {
            return expr;
        }
    }

    throw new SimplificationError("simplify() got encountered unusual depth");
}

export function negationNormalForm(expr: AstExpr): AstExpr {
    return unimplemented();
}

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
            return findAndRemoveOneImplies(expr.child);
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

    throw new SimplificationError("findAndRemoveOneImplies() got unrecognized AstExprKind");
}

// NOTE: Existing justifications in the provided expression
// are not in the resulting expression
export function oldRemoveImplies(expr: AstExpr): AstExpr {
    switch (expr.type) {
        case AstExprKind.Symbol:
        case AstExprKind.Tautology:
        case AstExprKind.Contradiction:
            return expr;
        case AstExprKind.Not:
            return removeImplies(expr.child);
        case AstExprKind.And:
        case AstExprKind.Or:
            return binaryExpr(expr.type, removeImplies(expr.a), removeImplies(expr.b), expr.flavor);
        case AstExprKind.All:
        case AstExprKind.Any:
            return selectExpr(expr.type, ...expr.children.map((child) => removeImplies(child)));
        case AstExprKind.Implies:
            return byDefinitionOfImplies(
                reducedImplies(removeImplies(expr.a), removeImplies(expr.b)),
                expr
            );
    }

    throw new SimplificationError("removeImplies() got unrecognized AstExprKind");
}

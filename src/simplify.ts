
import unimplemented from 'ts-unimplemented';
import { CustomError } from 'ts-custom-error';
import { AstExpr, AstExprKind, areExprsIdentical } from './ast';

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
    switch (expr.type) {
        case AstExprKind.Symbol:
            return expr;
        case AstExprKind.Not:
            return removeImplies(expr.child);
        case AstExprKind.And:
        case AstExprKind.Or:
            return { type: expr.type, a: removeImplies(expr.a), b: removeImplies(expr.b) };
        case AstExprKind.All:
        case AstExprKind.Any:
            return { type: expr.type, children: expr.children.map((child) => removeImplies(child)) };
        case AstExprKind.Implies:
            return {
                type: AstExprKind.Or,
                a: { type: AstExprKind.Not, child: expr.a },
                b: expr.b
            };
    }

    throw new SimplificationError("removeImplies() got unrecognized AstExprKind");
}

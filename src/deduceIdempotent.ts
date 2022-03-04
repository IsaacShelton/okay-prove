
import { AstExpr, AstExprKind, AstSelectExpr } from "./ast";
import { makeConjunction, makeDisjunction } from "./astExprMaker";
import { areExprsEquivalent } from "./areExprsEquivalent";
import { byIdempotent } from "./justification";

export function deduceIdempotent(expr: AstExpr): AstExpr[] {
    switch (expr.type) {
        case AstExprKind.Or:
        case AstExprKind.And: {
            let stretch = areExprsEquivalent(expr.b, expr.a);

            if (stretch) {
                return [byIdempotent(stretch, expr)];
            } else {
                return [];
            }
        }
        case AstExprKind.Any:
            return deduceIdempotentForSelect(expr, (children) => makeDisjunction(children));
        case AstExprKind.All:
            return deduceIdempotentForSelect(expr, (children) => makeConjunction(children));
        default:
            return [];
    }
}

function deduceIdempotentForSelect(originalExpr: AstSelectExpr, selectionConstructorFunction: (children: AstExpr[]) => AstExpr): AstExpr[] {
    let running: AstExpr = originalExpr;

    // TODO: CLEANUP: Clean up this code - It really seems to not want to be cleaned up
    for (let i = 0; (running.type === AstExprKind.Any || running.type === AstExprKind.All) && i < running.children.length; i++) {
        for (let j = 0; j < i; j++) {
            if (running.type !== AstExprKind.Any && running.type !== AstExprKind.All) {
                return running !== originalExpr ? [running] : [];
            }

            let stretch = areExprsEquivalent(running.children[i], running.children[j]);

            if (stretch) {
                let remaining = [...running.children.slice(0, i), ...running.children.slice(i + 1)];
                running = selectionConstructorFunction(remaining);
                i--;
                j = 0;
            }
        }
    }

    return running !== originalExpr ? [running] : [];
}

function isSelectKind(type: AstExprKind): boolean {
    return type == AstExprKind.Any || type == AstExprKind.All;
}

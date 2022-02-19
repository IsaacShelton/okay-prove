
import { AstExpr, AstExprKind, AstSelectExpr } from "./ast";
import { binaryExpr, selectExpr } from "./astExprMaker";
import { areExprsEquivalent } from "./canConclude";
import { byCommutative } from "./justification";

export function canCommutative(from: AstExpr, to: AstExpr): AstExpr | null {
    switch (from.type) {
        case AstExprKind.Or:
        case AstExprKind.And:
            if (from.type == to.type) {
                let stretchA = areExprsEquivalent(from.a, to.b);
                let stretchB = areExprsEquivalent(from.b, to.a);

                if (stretchA && stretchB) {
                    return byCommutative(binaryExpr(from.type, stretchB, stretchA, from.flavor), from);
                }
            }
            break;
        case AstExprKind.Any:
        case AstExprKind.All:
            if (from.type == to.type) {
                return canCommutativeForSelectExprs(from, to);
            }
            break;
    }

    return null;
}

function canCommutativeForSelectExprs(from: AstSelectExpr, to: AstSelectExpr): AstExpr | null {
    let fromChildren = [...from.children];
    let toChildren = [...to.children];
    let result = [];

    for (let toChild of toChildren) {
        for (let fromChild of fromChildren) {
            let stretch = areExprsEquivalent(fromChild, toChild);

            if (stretch !== null) {
                fromChildren = fromChildren.filter((child) => child !== fromChild);
                toChildren = toChildren.filter((child) => child !== fromChild);
                result.push(stretch);
                break;
            } else {
                return null;
            }
        }
    }

    // NOTE: More than just commutative is going on here, but commutative is the most important.
    // In some cases specialization/idempotent/associative/etc may also have taken place, but we will ignore that for now.
    // TODO: Include justifications for all operations done here
    return byCommutative(selectExpr(from.type, ...result), from);
}

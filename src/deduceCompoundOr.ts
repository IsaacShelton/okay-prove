
import { AstExpr } from "./ast";
import { any } from "./astExprMaker";
import { isCompoundOr, reduceCompoundOr } from "./compoundOr";

export function deduceCompoundOr(fact: AstExpr): AstExpr[] {
    if (isCompoundOr(fact)) {
        return [any(...reduceCompoundOr(fact))];
    } else {
        return [];
    }
}

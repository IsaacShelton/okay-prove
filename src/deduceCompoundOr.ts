
import { AstExpr } from "./ast";
import { any } from "./astExprMaker";
import { isCompoundOr, reduceCompoundOr } from "./compoundOr";
import { byAssociative } from "./justification";

export function deduceCompoundOr(fact: AstExpr): AstExpr[] {
    if (isCompoundOr(fact)) {
        return [byAssociative(any(...reduceCompoundOr(fact)), fact)];
    } else {
        return [];
    }
}


import { AstExpr } from "./ast";
import { findAndRemoveOneDoubleNegation } from "./findAndRemoveOneDoubleNegation";

export function deduceDoubleNegation(from: AstExpr): AstExpr[] {
    let x = findAndRemoveOneDoubleNegation(from);
    return x ? [x] : [];
}

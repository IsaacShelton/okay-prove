
import { AstExpr } from "./ast";
import { findAndRemoveOneAssertion } from "./findAndRemoveOneAssertion";

export function deduceAssertion(from: AstExpr): AstExpr[] {
    let x = findAndRemoveOneAssertion(from);
    return x ? [x] : [];
}

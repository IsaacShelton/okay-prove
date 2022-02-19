
import { AstExpr } from "./ast";
import { visualizeExpr, visualizeProof } from "./visualize";

export function logProof(expr: AstExpr) {
    console.log(visualizeProof(expr, 'cascade'));
}

export function logExpr(expr: AstExpr) {
    console.log(visualizeExpr(expr));
}

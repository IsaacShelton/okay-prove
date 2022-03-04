
import { AstExpr } from "./ast";
import { okayProve } from "./okayProve";
import { parseOrFail } from "./testing";
import { visualizeExpr, visualizeProof } from "./visualize";

export function logProof(expr: AstExpr | null) {
    if (expr === null) {
        console.log("(null proof)");
    } else {
        console.log(visualizeProof(expr, 'cascade'));
    }
}

export function logProofOrFail(content: string) {
    console.log(visualizeProof(okayProve(parseOrFail(content))!, 'cascade'));
}

export function logExpr(expr: AstExpr) {
    console.log(visualizeExpr(expr));
}

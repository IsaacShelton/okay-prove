
import { AstExpr } from "./ast";
import { reverseIndentation, visualizeExpr, visualizeReasoning } from "./visualize";

export function visualizeProofCascade(expr: AstExpr, depth: number = 0, leftToRight: boolean = true) {
    let result = " ".repeat(depth) + visualizeExpr(expr);

    if (expr.justification) {
        result += visualizeReasoning(expr.justification.reasoning);

        // Iterate backwards, since we append the output in reverse order
        for (let reference of expr.justification.references) {
            result = visualizeProofCascade(reference, depth + 1, leftToRight) + "\n" + result;
        }
    }

    if (depth == 0 && leftToRight) {
        return reverseIndentation(result);
    } else {
        return result;
    }
}

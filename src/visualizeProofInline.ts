
import { AstExpr } from "./ast";
import { Justification } from "./justification";
import { reasoningName } from "./reasoning";
import { visualizeExpr } from "./visualize";
import { findRefLineNumber, flattenProof, Line } from "./visualizeLineProofUtils";

export function visualizeProofInline(conclusion: AstExpr) {
    let exprs = flattenProof(conclusion).reverse();

    let lines = exprs.map((expr, i) => {
        let lineNumber = makeLineNumber(i + 1);
        let representation = lineNumber + ". " + visualizeExpr(expr);
        return new Line(expr, representation);
    });

    let maxLineLength = lines.reduce((acc, line) => Math.max(acc, line.representation.length), 0);

    return lines.map((line) => {
        let representation = line.representation.padEnd(maxLineLength, ' ');
        let aside = makeAside(line.expr.justification, exprs);
        return representation + aside;
    }).join("\n") + " ☐\n";
}

function makeAside(justification: Justification | null | undefined, exprs: AstExpr[]): string {
    if (justification == null) return "";

    let refs = justification.references.map((ref) => {
        return "" + (findRefLineNumber(exprs, ref) ?? 0);
    }).join(", ");

    let reason = reasoningName(justification.reasoning);
    let references = refs ? ` : ${refs}` : "";
    return " [" + reason + references + "]";
}

function makeLineNumber(lineNumber: number): string {
    return ("" + lineNumber).padStart(2, " ");
}


import { AstExpr } from "./ast";
import { Justification } from "./justification";
import { reasoningFancyName } from "./reasoning";
import { visualizeExprLatex } from "./visualize";
import { findRefLineNumber, flattenProof, Line } from "./visualizeLineProofUtils";

export function visualizeProofLatex(conclusion: AstExpr) {
    let exprs = flattenProof(conclusion).reverse();

    let lines = exprs.map((expr, i) => {
        let lineNumber = makeLineNumber(i + 1);
        let representation = lineNumber + ".\\ & " + visualizeExprLatex(expr);
        return new Line(expr, representation);
    });

    let maxLineLength = lines.reduce((acc, line) => Math.max(acc, line.representation.length), 0);

    let beginning = "\\begin{proof*}\n    \\begin{align*}\n";
    let ending = "    \\end{align*}\n\\end{proof*}\n";

    return beginning + lines.map((line) => {
        let representation = line.representation.padEnd(maxLineLength, ' ');
        let aside = makeAside(line.expr.justification, exprs);
        return "    " + representation + aside;
    }).join(" \\\\\n") + " \\qedhere\n" + ending;
}

function makeAside(justification: Justification | null | undefined, exprs: AstExpr[]): string {
    if (justification == null) return "";

    let refs = justification.references.map((ref) => {
        return "" + (findRefLineNumber(exprs, ref) ?? 0);
    }).join(", ");

    let reason = reasoningFancyName(justification.reasoning);
    let references = refs ? ` : $${refs}$` : "";

    return ` && \\aside{${reason + references}}`;
}

function makeLineNumber(lineNumber: number): string {
    return ("" + lineNumber);
}

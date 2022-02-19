
import { areExprsIdentical, AstExpr } from "./ast";

export class Line {
    constructor(public expr: AstExpr, public representation: string) { }
}

export function flattenProof(expr: AstExpr): AstExpr[] {
    if (expr.justification) {
        return [expr, ...expr.justification.references.flatMap(flattenProof)]
    } else {
        return [expr];
    }
}

export function findRefLineNumber(exprs: AstExpr[], ref: AstExpr): number | null {
    for (let i = 0; i < exprs.length; i++) {
        if (areExprsIdentical(exprs[i], ref)) {
            return i + 1;
        }
    }

    return null;
}

import { AstExpr } from "./ast";
import { canDeMorgansBackwards, canDeMorgansForward, doubleNegate } from "./canDeMorgans";

export function deduceDeMorgans(from: AstExpr): AstExpr[] {
    return [
        canDeMorgansForward(from),
        canDeMorgansBackwards(from),
        canDeMorgansForward(doubleNegate(from))
    ].filter((x) => x !== null) as AstExpr[];
}

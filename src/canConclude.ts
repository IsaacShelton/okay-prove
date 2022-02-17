import { areExprsIdentical, AstExpr, AstExprKind } from "./ast";
import { and } from "./astExprMaker";
import { canDeMorgans } from "./canDeMorgans";
import { canDoubleNegate } from "./canDoubleNegate";
import { byConjunction, byConjunctions, byGeneralization } from "./justification";
import { opposite } from "./opposite";

export function canConclude(facts: AstExpr[], conclusion: AstExpr): AstExpr | null {
    // First check if any of the existing facts are logically equivalent
    // to the conclusion,
    // If so, then the justification for the expression
    // is enough to conclude the conclusion
    for (let fact of facts) {
        let stretch = areExprsEquivalent(fact, conclusion);

        if (stretch !== null) {
            return stretch;
        }
    }

    // Next, check if we can construct the conclusion from
    // existing logically equivalent facts
    let construction = canConstruct(facts, conclusion);

    if (construction !== null) {
        return construction;
    }

    // Potentially more steps in the future
    // ...

    // Otherwise, we are unable to reach to conclusion
    return null;
}

export function areExprsEquivalent(from: AstExpr, to: AstExpr, maxRecursion: number = 3): AstExpr | null {
    if (areExprsIdentical(from, to)) return from;

    // Don't do further testing if too deep
    if (maxRecursion <= 0) return null;

    function trial(trial: AstExpr | null, to: AstExpr, maxRecursion: number) {
        if (trial !== null && areExprsEquivalent(trial, to, maxRecursion - 1)) {
            return trial;
        } else {
            return null;
        }
    }

    return trial(canDeMorgans(from, to), to, maxRecursion)
        ?? trial(canDoubleNegate(from, to), to, maxRecursion);
}

function canConstruct(facts: AstExpr[], conclusion: AstExpr): AstExpr | null {
    switch (conclusion.type) {
        case AstExprKind.Symbol:
        case AstExprKind.Tautology:
        case AstExprKind.Contradiction:
            return null;
        case AstExprKind.Not:
            return canConclude(facts, opposite(conclusion));
        case AstExprKind.Or: {
            let a = canConclude(facts, conclusion.a);
            if (a !== null) return byGeneralization(conclusion, a);

            let b = canConclude(facts, conclusion.b);
            if (b !== null) return byGeneralization(conclusion, b);

            return null;
        }
        case AstExprKind.And: {
            let a = canConclude(facts, conclusion.a);
            if (a === null) return null;

            let b = canConclude(facts, conclusion.b);
            if (b === null) return null;

            return byConjunction(and(a, b), a, b);
        }
        case AstExprKind.Any: {
            for (let child of conclusion.children) {
                let childProof = canConclude(facts, child);
                if (childProof !== null) return childProof;
            }
            return null;
        }
        case AstExprKind.All: {
            let childProofs: AstExpr[] = [];

            for (let child of conclusion.children) {
                let childProof = canConclude(facts, child);
                if (childProof === null) return null;

                childProofs.push(childProof);
            }

            return byConjunctions(conclusion, ...childProofs);
        }
    }

    throw new Error("canConstruct() got unsupported expr kind");
}

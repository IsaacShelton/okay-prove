
import { areExprsIdentical } from './areExprsIdentical';
import { AstExpr, AstExprKind, Flavor } from './ast';
import { and } from './astExprMaker';
import { Reasoning } from './reasoning';

export class Justification {
    constructor(public reasoning: Reasoning, public references: AstExpr[]) { }
}

function justify(expr: AstExpr, reasoning: Reasoning, ...references: AstExpr[]): AstExpr {
    return { ...expr, justification: new Justification(reasoning, references) };
}

export const justifyUnsafe = justify;

export function byPremise(expr: AstExpr): AstExpr {
    return justify(expr, Reasoning.Premise);
}

export function byDefinitionOfImplies(expr: AstExpr, reference: AstExpr): AstExpr {
    return justify(expr, Reasoning.DefinitionOfImplies, reference);
}

export function byAssociative(expr: AstExpr, reference: AstExpr): AstExpr {
    return justify(expr, Reasoning.Associative, reference);
}

export function byDistributive(expr: AstExpr, reference: AstExpr): AstExpr {
    return justify(expr, Reasoning.Distributive, reference);
}

export function byIdentity(expr: AstExpr, reference: AstExpr): AstExpr {
    return justify(expr, Reasoning.Identity, reference);
}

export function byNegation(expr: AstExpr, reference: AstExpr): AstExpr {
    return justify(expr, Reasoning.Negation, reference);
}

export function byDoubleNegation(expr: AstExpr, reference: AstExpr): AstExpr {
    return justify(expr, Reasoning.DoubleNegation, reference);
}

export function byIdempotent(expr: AstExpr, reference: AstExpr): AstExpr {
    return justify(expr, Reasoning.Idempotent, reference);
}

export function byUniversalBounds(expr: AstExpr, reference: AstExpr): AstExpr {
    return justify(expr, Reasoning.UniversalBounds, reference);
}

export function byDeMorgans(expr: AstExpr, reference: AstExpr): AstExpr {
    return justify(expr, Reasoning.DeMorgans, reference);
}

export function byNegationOfTautology(expr: AstExpr, reference: AstExpr): AstExpr {
    return justify(expr, Reasoning.NegationOfTautology, reference);
}

export function byNegationOfContradiction(expr: AstExpr, reference: AstExpr): AstExpr {
    return justify(expr, Reasoning.NegationOfContradiction, reference);
}

export function byCommutative(expr: AstExpr, reference: AstExpr): AstExpr {
    return justify(expr, Reasoning.Commutative, reference);
}

export function bySpecialization(expr: AstExpr, reference: AstExpr): AstExpr {
    return justify(expr, Reasoning.Specialization, reference);
}

export function byGeneralization(expr: AstExpr, reference: AstExpr): AstExpr {
    return justify(expr, Reasoning.Generalization, reference);
}

export function byConjunction(expr: AstExpr, reference1: AstExpr, reference2: AstExpr): AstExpr {
    return justify(expr, Reasoning.Conjunction, reference1, reference2);
}

export function byConjunctions(expr: AstExpr, ...references: AstExpr[]): AstExpr {
    if (references.length < 1) throw new Error("byConjunctions() cannot create expression from no sub expressions");

    if (references.length == 1) {
        return references[0];
    }

    let result = byConjunction(and(references[0], references[1]), references[0], references[1]);

    for (let i = 2; i < references.length; i++) {
        result = byConjunction(and(result, references[i]), result, references[i]);
    }

    return result;
}

export function byElimination(expr: AstExpr, group: AstExpr, counter: AstExpr): AstExpr {
    let reasoning = Reasoning.Elimination;

    // Implies-related naming for elimination
    if (group.type == AstExprKind.Or && group.flavor == Flavor.Implies) {
        if (areExprsIdentical(group.b, expr)) {
            reasoning = Reasoning.ModusPonens;

            if (group.justification?.reasoning == Reasoning.DefinitionOfImplies) {
                return justify(expr, reasoning, group.justification.references[0], counter);
            }
        } else if (areExprsIdentical(group.a, expr)) {
            reasoning = Reasoning.ModusTollens;

            if (group.justification?.reasoning == Reasoning.DefinitionOfImplies) {
                return justify(expr, reasoning, group.justification.references[0], counter);
            }
        }
    }

    return justify(expr, reasoning, group, counter);
}

export function byTransitivity(expr: AstExpr, aRef: AstExpr, bRef: AstExpr): AstExpr {
    if (aRef.type == AstExprKind.Or
        && aRef.justification?.reasoning == Reasoning.DefinitionOfImplies) {
        aRef = aRef.justification.references[0];
    }

    if (bRef.type == AstExprKind.Or
        && bRef.justification?.reasoning == Reasoning.DefinitionOfImplies) {
        bRef = bRef.justification.references[0];
    }

    return justify(expr, Reasoning.Transitivity, aRef, bRef);
}

// You can forcefully justify by elimination using this function
// (mostly for testing)
export function byStrictElimination(expr: AstExpr, group: AstExpr, counter: AstExpr): AstExpr {
    return justify(expr, Reasoning.Elimination, group, counter);
}

// You can forcefully justify by modus ponens using this function
// (mostly for testing, since modus ponens will automatically be used for the justification in 'byElimination' when applicable)
export function byStrictModusPonens(expr: AstExpr, group: AstExpr, counter: AstExpr): AstExpr {
    return justify(expr, Reasoning.ModusPonens, group, counter);
}

// You can forcefully justify by modus tollens using this function
// (mostly for testing, since modus tollens will automatically be used for the justification in 'byElimination' when applicable)
export function byStrictModusTollens(expr: AstExpr, group: AstExpr, counter: AstExpr): AstExpr {
    return justify(expr, Reasoning.ModusTollens, group, counter);
}

export function byStrictTransitivity(expr: AstExpr, aRef: AstExpr, bRef: AstExpr): AstExpr {
    return justify(expr, Reasoning.Transitivity, aRef, bRef);
}

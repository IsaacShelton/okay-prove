
import { areExprsIdentical, AstExpr, AstExprKind, Flavor } from './ast';

export enum Reasoning {
    Premise,
    DefinitionOfImplies,
    Associative,
    Distributive,
    Identity,
    Negation,
    DoubleNegation,
    Idempotent,
    UniversalBounds,
    DeMorgans,
    Absorption,
    NegativeAssertion,
    Commutative,
    ModusPonens,
    ModusTollens,
    Generalization,
    Specialization,
    Conjunction,
    Elimination,
    Transitivity,
    ProofByDivisionOfCases,
    ContradictionRule,
}

export class Justification {
    constructor(public reasoning: Reasoning, public references: AstExpr[]) { }
}

function justify(expr: AstExpr, reasoning: Reasoning, ...references: AstExpr[]): AstExpr {
    return { ...expr, justification: new Justification(reasoning, references) };
}

export function byPremise(expr: AstExpr): AstExpr {
    return justify(expr, Reasoning.Premise);
}

export function byDefinitionOfImplies(expr: AstExpr, reference: AstExpr): AstExpr {
    return justify(expr, Reasoning.DefinitionOfImplies, reference);
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

export function byElimination(expr: AstExpr, reference: AstExpr): AstExpr {
    if (reference.type == AstExprKind.Or && reference.flavor == Flavor.Implies) {
        // Be specific about specialization when applicable
        if (areExprsIdentical(reference.b, expr)) {
            return justify(expr, Reasoning.ModusPonens, reference);
        } else if (areExprsIdentical(reference.a, expr)) {
            return justify(expr, Reasoning.ModusTollens, reference);
        }
    }

    return justify(expr, Reasoning.Elimination, reference);
}

// You can forcefully justify by elimination using this function
// (mostly for testing)
export function byStrictElimination(expr: AstExpr, reference: AstExpr): AstExpr {
    return justify(expr, Reasoning.Elimination, reference);
}

// You can forcefully justify by modus ponens using this function
// (mostly for testing, since modus ponens will automatically be used for the justification in 'byElimination' when applicable)
export function byStrictModusPonens(expr: AstExpr, reference: AstExpr): AstExpr {
    return justify(expr, Reasoning.ModusPonens, reference);
}

// You can forcefully justify by modus tollens using this function
// (mostly for testing, since modus tollens will automatically be used for the justification in 'byElimination' when applicable)
export function byStrictModusTollens(expr: AstExpr, reference: AstExpr): AstExpr {
    return justify(expr, Reasoning.ModusTollens, reference);
}

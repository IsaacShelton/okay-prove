
import { areExprsIdentical, AstExpr, AstExprKind, Flavor } from './ast';
import { and } from './astExprMaker';

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

export function byDoubleNegation(expr: AstExpr, reference: AstExpr): AstExpr {
    return justify(expr, Reasoning.DoubleNegation, reference);
}

export function byDeMorgans(expr: AstExpr, reference: AstExpr): AstExpr {
    return justify(expr, Reasoning.DeMorgans, reference);
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

export function reasoningName(reasoning: Reasoning) {
    switch (reasoning) {
        case Reasoning.Premise: return "premise";
        case Reasoning.DefinitionOfImplies: return "definition of implies";
        case Reasoning.Associative: return "associative";
        case Reasoning.Distributive: return "distributive";
        case Reasoning.Identity: return "identity";
        case Reasoning.Negation: return "negation";
        case Reasoning.DoubleNegation: return "double negation";
        case Reasoning.Idempotent: return "idempotent";
        case Reasoning.UniversalBounds: return "universal bounds";
        case Reasoning.DeMorgans: return "de morgan's";
        case Reasoning.Absorption: return "absorption";
        case Reasoning.NegativeAssertion: return "negative assertion";
        case Reasoning.Commutative: return "commutative";
        case Reasoning.ModusPonens: return "modus ponens";
        case Reasoning.ModusTollens: return "modus tollens";
        case Reasoning.Generalization: return "generalization";
        case Reasoning.Specialization: return "specialization";
        case Reasoning.Conjunction: return "conjunction";
        case Reasoning.Elimination: return "elimination";
        case Reasoning.Transitivity: return "transitivity";
        case Reasoning.ProofByDivisionOfCases: return "proof by division of cases";
        case Reasoning.ContradictionRule: return "contradiction rule";
    }

    throw new Error("reasoningName() got unrecognized justification");
}

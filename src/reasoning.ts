
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

export function reasoningName(reasoning: Reasoning) {
    return reasoningFancyName(reasoning).toLowerCase();
}

export function reasoningFancyName(reasoning: Reasoning) {
    switch (reasoning) {
        case Reasoning.Premise: return "Premise";
        case Reasoning.DefinitionOfImplies: return "Definition of Implies";
        case Reasoning.Associative: return "Associative";
        case Reasoning.Distributive: return "Distributive";
        case Reasoning.Identity: return "Identity";
        case Reasoning.Negation: return "Negation";
        case Reasoning.DoubleNegation: return "Double Negation";
        case Reasoning.Idempotent: return "Idempotent";
        case Reasoning.UniversalBounds: return "Universal Bounds";
        case Reasoning.DeMorgans: return "De Morgan's";
        case Reasoning.Absorption: return "Absorption";
        case Reasoning.NegativeAssertion: return "Negative Assertion";
        case Reasoning.Commutative: return "Commutative";
        case Reasoning.ModusPonens: return "Modus Ponens";
        case Reasoning.ModusTollens: return "Modus Tollens";
        case Reasoning.Generalization: return "Generalization";
        case Reasoning.Specialization: return "Specialization";
        case Reasoning.Conjunction: return "Conjunction";
        case Reasoning.Elimination: return "Elimination";
        case Reasoning.Transitivity: return "Transitivity";
        case Reasoning.ProofByDivisionOfCases: return "Proof by Division of Cases";
        case Reasoning.ContradictionRule: return "Contradiction Rule";
    }

    throw new Error("reasoning - unrecognized reasoning kind");
}

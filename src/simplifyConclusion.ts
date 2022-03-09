
import assert from 'assert';
import { AstBinaryExpr, AstExpr, AstExprKind } from './ast';
import { any, not, or } from './astExprMaker';
import { isCompoundOr, reduceCompoundOr } from './compoundOr';
import { findAndRemoveOneDoubleNegation } from './findAndRemoveOneDoubleNegation';
import { Reasoning } from './reasoning';
import { Waterfall } from './waterfall';

export function simplifyConclusion(conclusion: AstExpr): Waterfall {
    let waterfall = new Waterfall([conclusion], []);

    while (simplifyConclusionPart(waterfall)) { }

    return waterfall;
}

export function simplifyConclusionPart(waterfall: Waterfall): boolean {
    simplifyConclusionByRemovingDoubleNegations(waterfall);

    let conclusion = waterfall.getLatest();

    switch (conclusion.type) {
        case AstExprKind.Symbol:
        case AstExprKind.Tautology:
        case AstExprKind.Contradiction:
            return false;
        case AstExprKind.All:
            return false;
        case AstExprKind.Any:
            return false;
        case AstExprKind.Not:
            return false;
        case AstExprKind.And:
            return false;
        case AstExprKind.Or:
            return simplifyConclusionOr(conclusion, waterfall);
        case AstExprKind.Implies:
            return simplifyConclusionImplies(conclusion, waterfall);
    }

    throw new Error("simplifyConclusion() got unrecognized expr kind");
}

function simplifyConclusionByRemovingDoubleNegations(waterfall: Waterfall) {
    let latest: AstExpr = waterfall.getLatest();

    while (true) {
        let newLatest = findAndRemoveOneDoubleNegation(latest);

        if (newLatest) {
            waterfall.push(newLatest, Reasoning.DoubleNegation);
            latest = newLatest;
        } else {
            break;
        }
    }
}

function simplifyConclusionOr(conclusion: AstExpr, waterfall: Waterfall): boolean {
    if (isCompoundOr(conclusion)) {
        waterfall.push(any(...reduceCompoundOr(conclusion)), Reasoning.Associative);
        return true;
    } else {
        return false;
    }
}

function simplifyConclusionImplies(conclusion: AstBinaryExpr, waterfall: Waterfall): boolean {
    assert(conclusion.type == AstExprKind.Implies);

    waterfall.push(
        or(not(conclusion.a), conclusion.b),
        Reasoning.DefinitionOfImplies
    );

    return true;
}

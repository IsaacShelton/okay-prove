
import { assert } from 'console';
import { AstBinaryExpr, AstExpr, AstExprKind } from './ast';
import { any, binaryExpr, not, or, selectExpr } from './astExprMaker';
import { isCompoundOr, reduceCompoundOr } from './compoundOr';
import { Reasoning } from './justification';
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

function findAndRemoveOneDoubleNegation(expr: AstExpr): AstExpr | null {
    let withRemoved: AstExpr | null;

    switch (expr.type) {
        case AstExprKind.Symbol:
        case AstExprKind.Tautology:
        case AstExprKind.Contradiction:
            return null;
        case AstExprKind.Or:
        case AstExprKind.And:
        case AstExprKind.Implies:
            // (We go backwards so that reading the proof forwards is more human-readable)

            withRemoved = findAndRemoveOneDoubleNegation(expr.b);
            if (withRemoved) return binaryExpr(expr.type, expr.a, withRemoved, expr.flavor);

            withRemoved = findAndRemoveOneDoubleNegation(expr.a);
            if (withRemoved) return binaryExpr(expr.type, withRemoved, expr.b, expr.flavor);

            break;
        case AstExprKind.Any:
        case AstExprKind.All:
            // (We go backwards so that reading the proof forwards is more human-readable)
            for (let i = expr.children.length - 1; i >= 0; i--) {
                let child = expr.children[i];
                let withRemoved = findAndRemoveOneDoubleNegation(child);

                if (withRemoved) {
                    return selectExpr(expr.type, ...expr.children.slice(0, i), withRemoved, ...expr.children.slice(i + 1));
                }
            }
            break;
        case AstExprKind.Not:
            if (expr.child.type == AstExprKind.Not) {
                return expr.child.child;
            }
            break;
    }

    return null;
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

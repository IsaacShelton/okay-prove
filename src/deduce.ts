
import { AstExpr, mergeExprLists } from './ast';
import { deduceAssertion } from './deduceAssertion';
import { deduceCompoundOr } from './deduceCompoundOr';
import { deduceDeMorgans } from './deduceDeMorgans';
import { deduceDistribution } from './deduceDistribution';
import { deduceDoubleNegation } from './deduceDoubleNegation';
import { deduceElimination } from './deduceElimination';
import { deduceIdempotent } from './deduceIdempotent';
import { deduceNegation } from './deduceNegation';
import { deduceTransitivity } from './deduceTransitivity';
import { isNotNullOrUndefined } from './filters';

// Returns new facts that can be concluded that are not contained
// within 'premises'
export function deduce(facts: AstExpr[]): AstExpr[] {
    return mergeExprLists(
        facts,
        facts.flatMap(deduceCompoundOr),
        deduceElimination(facts),
        facts.flatMap(deduceAssertion),
        facts.flatMap(deduceDistribution),
        facts.flatMap(deduceDeMorgans),
        facts.flatMap(deduceDoubleNegation),
        facts.flatMap(deduceIdempotent),
        facts.map(deduceNegation).filter(isNotNullOrUndefined),
        deduceTransitivity(facts),
    );
}

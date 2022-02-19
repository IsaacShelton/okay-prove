
import { AstExpr, mergeExprLists } from './ast';
import { deduceCompoundOr } from './deduceCompoundOr';
import { deduceDeMorgans } from './deduceDeMorgans';
import { deduceDistribution } from './deduceDistribution';
import { deduceDoubleNegation } from './deduceDoubleNegation';
import { deduceElimination } from './deduceElimination';

// Returns new facts that can be concluded that are not contained
// within 'premises'
export function deduce(facts: AstExpr[]): AstExpr[] {
    return mergeExprLists(
        facts,
        facts.flatMap(deduceCompoundOr),
        deduceElimination(facts),
        facts.flatMap(deduceDistribution),
        facts.flatMap(deduceDeMorgans),
        facts.flatMap(deduceDoubleNegation),
    );
}

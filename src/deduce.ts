
import { AstExpr, mergeExprLists } from './ast';
import { deduceCompoundOr } from './deduceCompoundOr';
import { deduceDistribution } from './deduceDistribution';
import { deduceElimination } from './deduceElimination';

// Returns new facts that can be concluded that are not contained
// within 'premises'
export function deduce(facts: AstExpr[]): AstExpr[] {
    return mergeExprLists(
        facts,
        facts.flatMap(deduceCompoundOr),
        deduceElimination(facts),
        facts.flatMap(deduceDistribution),
    );
}

/*
export function deduceIntoCompoundImplies(facts: AstExpr[]): AstExpr[] {
    class Group {
        constructor(public differentSubs: AstExpr[], public commonGoal: AstExpr) { }
    }

    unimplemented!();

    // Group 'or' expressions that function as 'implies', together by common sub-expression
    let groups: Group[] = unimplemented();

    // Create combined group expression (with unique sub-expressions)
    // not p or z
    // not q or z
    // not r or z
    // not (p or q or r) or z

    return groups.map((group) => {
        return reducedImplies(any(...group.differentSubs.map(opposite)), group.commonGoal);
    });
}
*/

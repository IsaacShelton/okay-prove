
import { removeImplies } from './removeImplies';
import { parseOrFail } from './testing';
import { and, implies, reducedImplies } from './astExprMaker';
import { byDefinitionOfImplies } from './justification';

test("remove implies example 1", () => {
    let premise = parseOrFail("a implies b").conclusion;

    let proof = premise;
    proof = byDefinitionOfImplies(reducedImplies("a", "b"), premise)

    expect(removeImplies(premise)).toEqual(proof);
});

test("remove implies example 2", () => {
    let premise = parseOrFail("(a implies b) and (b implies a)").conclusion;

    let proof = premise;
    proof = byDefinitionOfImplies(and(reducedImplies("a", "b"), implies("b", "a")), proof);
    proof = byDefinitionOfImplies(and(reducedImplies("a", "b"), reducedImplies("b", "a")), proof);

    expect(removeImplies(premise)).toEqual(proof);
});

test("remove implies example 3", () => {
    let premise = parseOrFail("(a implies b) implies (b implies a)").conclusion;

    let proof = premise;
    proof = byDefinitionOfImplies(implies(reducedImplies("a", "b"), implies("b", "a")), proof);
    proof = byDefinitionOfImplies(implies(reducedImplies("a", "b"), reducedImplies("b", "a")), proof);
    proof = byDefinitionOfImplies(reducedImplies(reducedImplies("a", "b"), reducedImplies("b", "a")), proof);

    expect(removeImplies(premise)).toEqual(proof);
});

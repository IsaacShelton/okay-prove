
import { removeImplies } from './simplify';
import { parseForTesting } from './testing';
import { Ast } from './ast';
import { and, implies, reducedImplies } from './astExprMaker';
import { byDefinitionOfImplies } from './justification';
import { visualizeProof } from './visualize';

test("remove implies example 1", () => {
    let ast = parseForTesting("a implies b");

    if (!(ast instanceof Ast)) {
        fail();
    }

    expect(removeImplies(ast.conclusion)).toEqual(
        byDefinitionOfImplies(reducedImplies("a", "b"), ast.conclusion)
    );
});

test("remove implies example 2", () => {
    let ast = parseForTesting("(a implies b) and (b implies a)");

    if (!(ast instanceof Ast)) {
        fail();
    }

    let proof = ast.conclusion; // (not an actual conclusion, just used as expression)
    proof = byDefinitionOfImplies(and(reducedImplies("a", "b"), implies("b", "a")), proof);
    proof = byDefinitionOfImplies(and(reducedImplies("a", "b"), reducedImplies("b", "a")), proof);

    expect(removeImplies(ast.conclusion)).toEqual(proof);
});

test("remove implies example 3", () => {
    let ast = parseForTesting("(a implies b) implies (b implies a)");

    if (!(ast instanceof Ast)) {
        fail();
    }

    let proof = ast.conclusion; // (not an actual conclusion, just used as expression)
    proof = byDefinitionOfImplies(implies(reducedImplies("a", "b"), implies("b", "a")), proof);
    proof = byDefinitionOfImplies(implies(reducedImplies("a", "b"), reducedImplies("b", "a")), proof);
    proof = byDefinitionOfImplies(reducedImplies(reducedImplies("a", "b"), reducedImplies("b", "a")), proof);

    expect(removeImplies(ast.conclusion)).toEqual(
        proof,
    );
});

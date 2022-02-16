
import { removeImplies } from './simplify';
import { parseForTesting } from './testing';
import { Ast } from './ast';
import { and, implies, reducedImplies } from './astExprMaker';
import { byDefinitionOfImplies } from './justification';

test("remove implies example 1", () => {
    let ast = parseForTesting("a implies b");

    if (!(ast instanceof Ast)) {
        fail();
    }

    let implication1 = implies("a", "b");

    expect(removeImplies(ast.conclusion)).toEqual(
        byDefinitionOfImplies(reducedImplies("a", "b"), implication1)
    );
});

test("remove implies example 2", () => {
    let ast = parseForTesting("(a implies b) and (b implies a)");

    if (!(ast instanceof Ast)) {
        fail();
    }

    let implication1 = implies("a", "b");
    let implication2 = implies("b", "a");

    expect(removeImplies(ast.conclusion)).toEqual(
        and(
            byDefinitionOfImplies(reducedImplies("a", "b"), implication1),
            byDefinitionOfImplies(reducedImplies("b", "a"), implication2)
        )
    );
});

test("remove implies example 3", () => {
    let ast = parseForTesting("(a implies b) implies (b implies a)");

    if (!(ast instanceof Ast)) {
        fail();
    }

    let implication1 = implies("a", "b");
    let implication2 = implies("b", "a");
    let implication3 = implies(implication1, implication2);

    expect(removeImplies(ast.conclusion)).toEqual(
        byDefinitionOfImplies(reducedImplies(
            byDefinitionOfImplies(reducedImplies("a", "b"), implication1),
            byDefinitionOfImplies(reducedImplies("b", "a"), implication2)
        ), implication3),
    );
});


import { and, any, not, or, symbol } from './astExprMaker';
import { byAssociative, byElimination, byPremise, bySpecialization } from './justification';
import { okayProve } from './okayProve';
import { parseOrFail } from './testing';
import { visualizeProof } from './visualize';

test("proof 1", () => {
    let ast = parseOrFail(`
        a and b
        a
    `);

    expect(okayProve(ast)).toEqual(
        bySpecialization(symbol("a"), byPremise(and("a", "b")))
    );
});

test("proof 2", () => {
    let ast = parseOrFail(`
        a or b
        not b
        a
    `);

    expect(okayProve(ast)).toEqual(
        byElimination(symbol("a"), byPremise(or("a", "b")), byPremise(not("b")))
    );
});

test("proof 3", () => {
    let ast = parseOrFail(`
        a or b or c or d
        not b
        not a
        not d
        c
    `);

    expect(okayProve(ast)).not.toBeNull();
});

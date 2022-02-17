
import { and, not, or, symbol } from './astExprMaker';
import { byElimination, byPremise, bySpecialization } from './justification';
import { okayProve } from './okayProve';
import { parseOrFail } from './testing';

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

test("proof 4", () => {
    let ast = parseOrFail(`
        not not a
        a
    `);

    expect(okayProve(ast)).not.toBeNull();
});

test("proof 5", () => {
    let ast = parseOrFail(`
        a
        not not a
    `);

    expect(okayProve(ast)).not.toBeNull();
});

test("proof 6", () => {
    let ast = parseOrFail(`
        not (a or b)
        (not a) and (not b)
    `);

    expect(okayProve(ast)).not.toBeNull();
});

test("proof 7", () => {
    let ast = parseOrFail(`
        (not a) and (not b)
        not (a or b)
    `);

    expect(okayProve(ast)).not.toBeNull();
});

test("proof 8", () => {
    let ast = parseOrFail(`
        (not not a) and (not not b)
        not (a or b)
    `);

    expect(okayProve(ast)).not.toBeNull();
});

test("proof 9", () => {
    let ast = parseOrFail(`
        not (a or b)
        not not ( (not a) and (not b) )
    `);

    expect(okayProve(ast)).not.toBeNull();
});

test("proof 10", () => {
    let ast = parseOrFail(`
        not (a or b)
        ( (not not not a) and (not not not b) )
    `);

    expect(okayProve(ast)).not.toBeNull();
});

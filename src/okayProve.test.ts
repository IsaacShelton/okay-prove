
import { and, not, or, symbol } from './astExprMaker';
import { byCommutative, byDeMorgans, byDoubleNegation, byElimination, byPremise, bySpecialization } from './justification';
import { okayProve } from './okayProve';
import { parseOrFail } from './testing';
import { logProof } from './visualize';

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
        not (not a or not b)
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
        not a and not b
        not not not not not not not not not (a or b)
    `);

    expect(okayProve(ast)).not.toBeNull();
});

test("proof 11", () => {
    let ast = parseOrFail(`
        not (a or b)
        ( (not not not a) and (not not not b) )
    `);

    let proof;
    proof = byPremise(not(or("a", "b")));
    proof = byDeMorgans(and(not("a"), not("b")), proof);
    proof = byDoubleNegation(and(not(not(not("a"))), not("b")), proof);
    proof = byDoubleNegation(and(not(not(not("a"))), not(not(not("b")))), proof);

    expect(okayProve(ast)).toEqual(proof);
});

test("proof 12", () => {
    let ast = parseOrFail(`
        p and q
        q and p
    `);

    let premise = byPremise(and("p", "q"));
    let proof = byCommutative(and("q", "p"), premise);

    expect(okayProve(ast)).toEqual(proof);
});

test("proof 13", () => {
    let ast = parseOrFail(`
        p or q
        q or p
    `);

    expect(okayProve(ast)).not.toBeNull();
});

test("proof 14", () => {
    let ast = parseOrFail(`
        p implies q
        p
        q
    `);

    expect(okayProve(ast)).not.toBeNull();
});

test("proof 15", () => {
    let ast = parseOrFail(`
        p implies q
        not q
        not p
    `);

    expect(okayProve(ast)).not.toBeNull();
});

test("proof 16", () => {
    let ast = parseOrFail(`
        (p and q) or (p and r)
        p
    `);

    expect(okayProve(ast)).not.toBeNull();
});

test("proof 17", () => {
    let ast = parseOrFail(`
        ((a or b) and q) or ((b or a) and r)
        b or a
    `);

    logProof(okayProve(ast)!);

    expect(okayProve(ast)).not.toBeNull();
});

test("proof 18", () => {
    let ast = parseOrFail(`
        (q and (a or b)) or ((b or a) and r)
        b or a
    `);

    logProof(okayProve(ast)!);

    expect(okayProve(ast)).not.toBeNull();
});

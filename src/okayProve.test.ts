
import { and, not, or, symbol } from './astExprMaker';
import { byCommutative, byDeMorgans, byDoubleNegation, byElimination, byPremise, bySpecialization } from './justification';
import { logProof, logProofOrFail } from './log';
import { okayProve } from './okayProve';
import { expectProvable, parseOrFail } from './testing';

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
    expectProvable(`
        a or b or c or d
        not b
        not a
        not d
        c
    `);
});

test("proof 4", () => {
    expectProvable(`
        not not a
        a
    `);
});

test("proof 5", () => {
    expectProvable(`
        a
        not not a
    `);
});

test("proof 6", () => {
    expectProvable(`
        not (a or b)
        (not a) and (not b)
    `);
});

test("proof 7", () => {
    expectProvable(`
        (not a) and (not b)
        not (a or b)
    `);
});

test("proof 8", () => {
    expectProvable(`
        (not not a) and (not not b)
        not (not a or not b)
    `);
});

test("proof 9", () => {
    expectProvable(`
        not (a or b)
        not not ( (not a) and (not b) )
    `);
});

test("proof 10", () => {
    expectProvable(`
        not a and not b
        not not not not not not not not not (a or b)
    `);
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
    expectProvable(`
        p or q
        q or p
    `);
});

test("proof 14", () => {
    expectProvable(`
        p implies q
        p
        q
    `);
});

test("proof 15", () => {
    expectProvable(`
        p implies q
        not q
        not p
    `);
});

test("proof 16", () => {
    expectProvable(`
        (p and q) or (p and r)
        p
    `);
});

test("proof 17", () => {
    expectProvable(`
        ((a or b) and q) or ((b or a) and r)
        b or a
    `);
});

test("proof 18", () => {
    expectProvable(`
        (q and (a or b)) or ((b or a) and r)
        b or a
    `);
});

test("proof 19", () => {
    expectProvable(`
        p or not(r or q)
        s implies r
        not p
        not s
    `);
});

test("proof 20", () => {
    expectProvable(`
        p and q implies r
        u implies not r
        u and q
        not p
    `);
});

test("proof 21", () => {
    expectProvable(`
        p implies (q implies r)
        not ((q implies r) and s)
        not (p and s) implies u and w
        x implies not u
        s
        not x
    `);
});

test("proof 22", () => {
    expectProvable(`
        H or M
        H implies K
        not K
        M implies L
        L
    `);
});

test("proof 23", () => {
    expectProvable(`
        E implies (G implies U)
        G and not U
        not E
    `);
});

test("proof 24", () => {
    expectProvable(`
        a implies b
        b implies c
        a implies c
    `);
});

test("proof 25", () => {
    expectProvable(`
        a implies b
        b implies c
        c implies d
        d implies e
        e implies f
        a implies f
    `);
});

test("proof 26", () => {
    expectProvable(`
        a or !
        a
    `);
});

test("proof 27", () => {
    expectProvable(`
        . and b
        b
    `);
});

test("proof 28", () => {
    expectProvable(`
        not . or b
        b
    `);
});

test("proof 29", () => {
    expectProvable(`
        not . or not !
        .
    `);
});

test("proof 30", () => {
    expectProvable(`
        .
    `);
});

test("proof 31", () => {
    expectProvable(`
        not !
    `);
});

test("proof 32", () => {
    expectProvable(`
        . and not !
    `);
});

test("proof 33", () => {
    expectProvable(`
        . and (not !) and . and (not !) and . and (not !)
    `);
});

test("proof 34", () => {
    expectProvable(`
        p or q
        p implies r
        q implies r
        r
    `);
});

test("proof 35", () => {
    expectProvable(`
        p or p
        p
    `);
});

test("proof 36", () => {
    expectProvable(`
        (not p or not p) or (not q or not q)
        not p or not q
    `);
});

// failing
test("proof 37", () => {
    expectProvable(`
        q or not (p or not p)
        q
    `);
});

test("proof 38", () => {
    expectProvable(`
        q implies (p and not p)
        not q
    `);

    logProofOrFail(`
        q implies (p and not p)
        not q
    `);
});

/*
test("proof", () => {
    // stalls
    expectProvable(`
        not q or (not q or q)
        q
    `);
});
*/

/*
test("proof", () => {
    expectProvable(`
        q or not (p or not p)
        q
    `);
});
*/

/*
test("proof", () => {
    expectProvable(`
        p or not p
    `);
});
*/

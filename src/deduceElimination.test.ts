

import { any, not, or, symbol } from "./astExprMaker";
import { deduceElimination } from "./deduceElimination";
import { byAssociative, byElimination } from "./justification";

test("deduceElimination simple example 0", () => {
    let facts = [or("a", "b")];
    expect(deduceElimination(facts)).toEqual([]);
});

test("deduceElimination simple example 1", () => {
    let facts = [or("a", "b"), not("a")];

    expect(deduceElimination(facts)).toEqual([
        byElimination(symbol("b"), facts[0], facts[1])
    ]);
});

test("deduceElimination simple example 2", () => {
    let facts = [or("a", "b"), not("b")];

    expect(deduceElimination(facts)).toEqual([
        byElimination(symbol("a"), facts[0], facts[1])
    ]);
});

test("deduceElimination simple example 3", () => {
    let facts = [or(not("a"), "b"), symbol("a")];

    expect(deduceElimination(facts)).toEqual([
        byElimination(symbol("b"), facts[0], facts[1])
    ]);
});

test("deduceElimination simple example 4", () => {
    let facts = [or("a", not("b")), symbol("b")];

    expect(deduceElimination(facts)).toEqual([
        byElimination(symbol("a"), facts[0], facts[1])
    ]);
});

test("deduceElimination simple example 5", () => {
    let facts = [or("a", not("b")), not("a")];

    expect(deduceElimination(facts)).toEqual([
        byElimination(not("b"), facts[0], facts[1])
    ]);
});

test("deduceElimination simple example 6", () => {
    let facts = [or(not("a"), "b"), not("b")];

    expect(deduceElimination(facts)).toEqual([
        byElimination(not("a"), facts[0], facts[1])
    ]);
});

// ---

test("deduceElimination 'any' collapse 0", () => {
    let facts = [any()];
    expect(deduceElimination(facts)).toEqual([]);
});

test("deduceElimination 'any' collapse 1", () => {
    let facts = [any("a", "b")];

    expect(deduceElimination(facts)).toEqual([
        byAssociative(or("a", "b"), facts[0])
    ]);
});

test("deduceElimination 'any' collapse 2", () => {
    let facts = [any("a")];

    expect(deduceElimination(facts)).toEqual([
        byAssociative(symbol("a"), facts[0])
    ]);
});

test("deduceElimination 'any' collapse 3", () => {
    let facts = [any("a", "b"), not("b")];
    let deduction = byAssociative(or("a", "b"), facts[0]);

    // --- First iteration of deducing with elimination ---
    expect(deduceElimination(facts)).toEqual([deduction]);

    let newFacts = facts.concat([deduction]);

    expect(newFacts).toEqual([...facts, deduction]);

    // --- Second iteration of deducing with elimination ---
    // Note that previous deductions will also be repeated,
    // it is up to the user to de-duplicate expressions
    expect(deduceElimination(newFacts)).toEqual([
        deduction,
        byElimination(symbol("a"), newFacts[2], newFacts[1])
    ]);
});

// ---

test("deduceElimination compound example 1", () => {
    let facts = [any("a", "b", "c"), not("b")];

    expect(deduceElimination(facts)).toEqual([
        byElimination(any("a", "c"), facts[0], facts[1])
    ]);
});

test("deduceElimination compound example 2", () => {
    let facts = [any("a", "b", "c"), not("a")];

    expect(deduceElimination(facts)).toEqual([
        byElimination(any("b", "c"), facts[0], facts[1])
    ]);
});

test("deduceElimination compound example 3", () => {
    let facts = [any("a", "b", "c"), not("c")];

    expect(deduceElimination(facts)).toEqual([
        byElimination(any("a", "b"), facts[0], facts[1])
    ])
});

test("deduceElimination compound example 4", () => {
    let facts = [any("a", "b", "c", "d"), not("c")];

    expect(deduceElimination(facts)).toEqual([
        byElimination(any("a", "b", "d"), facts[0], facts[1])
    ])
});

test("deduceElimination compound example 5", () => {
    let facts = [any("a", "b", "c", "d", "e"), not("a")];

    expect(deduceElimination(facts)).toEqual([
        byElimination(any("b", "c", "d", "e"), facts[0], facts[1])
    ])
});

test("deduceElimination compound example 6", () => {
    let facts = [any("a", "b", "c", "d", "e"), not("e")];

    expect(deduceElimination(facts)).toEqual([
        byElimination(any("a", "b", "c", "d"), facts[0], facts[1])
    ])
});

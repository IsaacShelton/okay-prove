

import { not, or, symbol } from "./astExprMaker";
import { deduceElimination } from "./deduceElimination";

test("deduceElimination simple example 0", () => {
    let facts = [or("a", "b")];
    expect(deduceElimination(facts)).toEqual([]);
});

test("deduceElimination simple example 1", () => {
    let facts = [or("a", "b"), not("a")];

    expect(deduceElimination(facts)).toEqual([
        symbol("b")
    ]);
});

test("deduceElimination simple example 2", () => {
    let facts = [or("a", "b"), not("b")];

    expect(deduceElimination(facts)).toEqual([
        symbol("a")
    ]);
});

test("deduceElimination simple example 3", () => {
    let facts = [or(not("a"), "b"), symbol("a")];

    expect(deduceElimination(facts)).toEqual([
        symbol("b")
    ]);
});

test("deduceElimination simple example 4", () => {
    let facts = [or("a", not("b")), symbol("b")];

    expect(deduceElimination(facts)).toEqual([
        symbol("a")
    ]);
});

test("deduceElimination simple example 5", () => {
    let facts = [or("a", not("b")), not("a")];

    expect(deduceElimination(facts)).toEqual([
        not("b")
    ]);
});

test("deduceElimination simple example 6", () => {
    let facts = [or(not("a"), "b"), not("b")];

    expect(deduceElimination(facts)).toEqual([
        not("a")
    ]);
});


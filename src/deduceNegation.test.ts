
import { all, and, any, contradiction, not, or, tautology } from "./astExprMaker";
import { deduceNegation } from "./deduceNegation";
import { byNegation } from "./justification";

test("deduceNegation test 1 - expect nothing", () => {
    let before = and("a", "b");
    expect(deduceNegation(before)).toEqual(null);
});

test("deduceNegation test 2 - expect nothing", () => {
    let before = and("a", not("b"));
    expect(deduceNegation(before)).toEqual(null);
});

test("deduceNegation test 3 - expect nothing", () => {
    let before = or("a", "b");
    expect(deduceNegation(before)).toEqual(null);
});

test("deduceNegation test 4 - expect nothing", () => {
    let before = or("a", not("b"));
    expect(deduceNegation(before)).toEqual(null);
});

test("deduceNegation test 5 - expect nothing", () => {
    let before = any("a", not("b"));
    expect(deduceNegation(before)).toEqual(null);
});

test("deduceNegation test 6 - expect nothing", () => {
    let before = all("a", not("b"));
    expect(deduceNegation(before)).toEqual(null);
});

test("deduceNegation test 7 - something", () => {
    let before = or("a", not("a"));
    expect(deduceNegation(before)).toEqual(
        byNegation(tautology(), before)
    );
});

test("deduceNegation test 8 - something", () => {
    let before = and("a", not("a"));
    expect(deduceNegation(before)).toEqual(
        byNegation(contradiction(), before)
    );
});

test("deduceNegation test 9 - something", () => {
    let x = and("a", "b");
    let before = or(x, not(x));
    expect(deduceNegation(before)).toEqual(
        byNegation(tautology(), before)
    );
});

test("deduceNegation test 10 - something", () => {
    let x = and("a", "b");
    let before = and(x, not(x));
    expect(deduceNegation(before)).toEqual(
        byNegation(contradiction(), before)
    );
});

test.only("deduceNegation test 11 - something", () => {
    let x = and(and(and("a", "b"), "d"), "c");
    let xSimilar = and(and(and("b", "a"), "c"), "d");
    let before = or(x, not(xSimilar));

    expect(deduceNegation(before)).toEqual(
        byNegation(tautology(), before)
    );
});

test("deduceNegation test 12 - something", () => {
    let x = and(and(and("a", "b"), "d"), "c");
    let xSimilar = and(and(and("b", "a"), "c"), "d");

    let before = and(x, not(xSimilar));
    expect(deduceNegation(before)).toEqual(
        byNegation(contradiction(), before)
    );
});


import { areExprListsEquivalentUnordered, areExprsEquivalent, unwrapCommonOuterNegations } from "./areExprsEquivalent";
import { and, any, not, or, symbol } from "./astExprMaker";

test("areExprsEquivalent no test 1", () => {
    let a = symbol("a");
    let b = not("a");
    expect(areExprsEquivalent(a, b)).toBeNull();
});

test("areExprsEquivalent no test 2", () => {
    let a = not("a");
    let b = not(not("a"));
    expect(areExprsEquivalent(a, b)).toBeNull();
});

test("areExprsEquivalent no test 3", () => {
    let a = or("a", "b");
    let b = and("a", "b");
    expect(areExprsEquivalent(a, b)).toBeNull();
});

test("areExprsEquivalent yes test 1", () => {
    let a = not(or("a", "b"));
    let b = and(not("a"), not("b"));
    expect(areExprsEquivalent(a, b)).not.toBeNull();
});

test("areExprsEquivalent yes test 2", () => {
    let a = not(not(or(not("a"), not("b"))));
    let b = not(and("a", "b"));
    expect(areExprsEquivalent(a, b)).not.toBeNull();
});

test("areExprsEquivalent yes test 3", () => {
    let a = or(not("a"), not("b"));
    let b = not(and("a", "b"));
    expect(areExprsEquivalent(a, b)).not.toBeNull();
});

test("areExprsEquivalent yes test 4", () => {
    let a = any("a", "b", "c", "d");
    let b = any("b", "a", "d", "c");
    expect(areExprsEquivalent(a, b)).not.toBeNull();
});

test("areExprsEquivalent yes test 5", () => {
    let a = not(any("a", "b", "c", "d"));
    let b = not(any("b", "a", "d", "c"));
    expect(areExprsEquivalent(a, b)).not.toBeNull();
});

test("areExprsEquivalent yes test 6", () => {
    let a = symbol("a");
    let b = not(not("a"));

    expect(areExprsEquivalent(a, b)).not.toBeNull();
});

test("areExprsEquivalent yes test 7", () => {
    let a = not("a");
    let b = not(not(not("a")));
    expect(areExprsEquivalent(a, b)).not.toBeNull();
});

test("areExprsEquivalent yes test 8", () => {
    let a = not(any(not("a"), "b", "c", "d"));
    let b = not(any("b", not(not(not("a"))), "d", "c"));
    expect(areExprsEquivalent(a, b)).not.toBeNull();
});

test("areExprsEquivalent yes test 9", () => {
    let a = and(and(and("a", "b"), "c"), "d");
    let b = and(and(and("a", "b"), "c"), "d");
    expect(areExprsEquivalent(a, b)).not.toBeNull();
});

test("areExprsEquivalent yes test 10", () => {
    let a = and(and(and("a", "b"), "d"), "c");
    let b = and(and(and("b", "a"), "c"), "d");
    expect(areExprsEquivalent(a, b)).not.toBeNull();
});

test("areExprsEquivalent yes test 11", () => {
    let a = and(and(and("a", "b"), "d"), "c");
    let b = not(not(and(and(and("b", "a"), "c"), "d")));
    expect(areExprsEquivalent(a, b)).not.toBeNull();
});

test("areExprsEquivalent yes test 12", () => {
    let a = and(and(and("a", "b"), not(not("d"))), "c");
    let b = not(not(and(and(and(not(not("b")), "a"), "c"), "d")));
    expect(areExprsEquivalent(a, b)).not.toBeNull();
});

// ---

test("areExprListsEquivalentUnordered yes test 1", () => {
    let a = [symbol("a"), symbol("b"), symbol("d"), symbol("c")];
    let b = [symbol("b"), symbol("a"), symbol("c"), symbol("d")];
    expect(areExprListsEquivalentUnordered(a, b)).not.toBeNull();
});

// ---

test("unwrapCommonOuterNegations yes test 1", () => {
    let a = not("a");
    let b = not(not(not("a")));
    let [, , numOuterNegations] = unwrapCommonOuterNegations(a, b);
    expect(numOuterNegations).toEqual(1);
});

test("unwrapCommonOuterNegations yes test 2", () => {
    let a = not(not(not("a")));
    let b = not(not(not("a")));
    let [, , numOuterNegations] = unwrapCommonOuterNegations(a, b);
    expect(numOuterNegations).toEqual(3);
});

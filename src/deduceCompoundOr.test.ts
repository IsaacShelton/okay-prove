
import { and, any, or } from "./astExprMaker";
import { deduceCompoundOr } from "./deduceCompoundOr";

test("deduceCompoundOr example 0", () => {
    let fact = or(and("a", "b"), or("c", or("d", "e")))

    expect(deduceCompoundOr(fact)).toEqual([
        any(and("a", "b"), "c", "d", "e")
    ]);
});

test("deduceCompoundOr example 1", () => {
    let fact = or(or("a", "b"), or("c", or("d", "e")))

    expect(deduceCompoundOr(fact)).toEqual([
        any("a", "b", "c", "d", "e")
    ]);
});

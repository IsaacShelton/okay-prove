
import { and, any, or } from "./astExprMaker";
import { deduceCompoundOr } from "./deduceCompoundOr";
import { byAssociative } from "./justification";

test("deduceCompoundOr example 0", () => {
    let fact = or(and("a", "b"), or("c", or("d", "e")))

    expect(deduceCompoundOr(fact)).toEqual([
        byAssociative(any(and("a", "b"), "c", "d", "e"), fact)
    ]);
});

test("deduceCompoundOr example 1", () => {
    let fact = or(or("a", "b"), or("c", or("d", "e")))

    expect(deduceCompoundOr(fact)).toEqual([
        byAssociative(any("a", "b", "c", "d", "e"), fact)
    ]);
});

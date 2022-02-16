
import { any, or } from "./astExprMaker";
import { simplifyConclusion } from "./simplifyConclusion";

test("simplify conclusion example 1", () => {
    let conclusion = or("a", or("b", "c"));

    expect(simplifyConclusion(conclusion)).toEqual(
        any("a", "b", "c")
    );
});

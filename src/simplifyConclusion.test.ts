
import { any, or } from "./astExprMaker";
import { Reasoning } from "./justification";
import { simplifyConclusion } from "./simplifyConclusion";
import { Waterfall } from "./waterfall";

test("simplify conclusion example 1", () => {
    let conclusion = or("a", or("b", "c"));

    expect(simplifyConclusion(conclusion)).toEqual(
        new Waterfall([conclusion, any("a", "b", "c")], [Reasoning.Associative])
    );
});

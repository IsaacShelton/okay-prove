
import dedent from "ts-dedent";
import { all, and, any, contradiction, implies, not, or, tautology } from "./astExprMaker";
import { okayProve } from "./okayProve";
import { parseOrFail } from "./testing";
import { visualizeProof, visualizeExpr } from "./visualize";

test("visualizeExpr test 1", () => {
    expect(visualizeExpr(
        and("a", "b")
    )).toEqual("a and b");
});

test("visualizeExpr test 2", () => {
    expect(visualizeExpr(
        or("a", "b")
    )).toEqual("a or b");
});

test("visualizeExpr test 3", () => {
    expect(visualizeExpr(
        or(and("a", "b"), and("c", "d"))
    )).toEqual("(a and b) or (c and d)");
});

test("visualizeExpr test 4", () => {
    expect(visualizeExpr(
        or(implies("a", "b"), and("c", "d"))
    )).toEqual("(a implies b) or (c and d)");
});

test("visualizeExpr test 5", () => {
    expect(visualizeExpr(
        or(or(not("a"), "b"), and("c", "d"))
    )).toEqual("(not a or b) or (c and d)");
});

test("visualizeExpr test 6", () => {
    expect(visualizeExpr(
        or(any("a", "b", "c"), all("d", "e", "f"))
    )).toEqual("(a or b or c) or (d and e and f)");
});

test("visualizeExpr test 7", () => {
    expect(visualizeExpr(
        and(
            or(tautology(), contradiction()),
            or(contradiction(), tautology())
        )
    )).toEqual("(. or !) and (! or .)");
});

// ---

test("visualizeProof test 1", () => {
    let expr = okayProve(parseOrFail(`
        a and b
        a
    `));

    if (expr === null) {
        fail();
    }

    expect(visualizeProof(expr)).toBe(dedent(
        ` a and b [premise]
        a [specialization]`
    ));
});


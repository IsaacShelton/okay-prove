
import { okayProve } from "./okayProve";
import { parseOrFail } from "./testing";
import { visualizeProofCascade } from "./visualizeProofCascade";

test("visualizeProofCascade test 1", () => {
    let expr = okayProve(parseOrFail(`
        a and b
        a
    `));

    if (expr === null) {
        fail();
    }

    expect(visualizeProofCascade(expr)).toBe(
        "a and b [premise]\n a [specialization]"
    );
});

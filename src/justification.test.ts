
import { not, or, reducedImplies, symbol } from "./astExprMaker";
import { byElimination, byStrictElimination, byStrictModusPonens, byStrictModusTollens } from "./justification";

test("elimination 1 - no specific kind", () => {
    let before = or("a", "b");
    let after = symbol("a");
    let counter = not("b")
    let elimination = byElimination(after, before, counter);

    expect(elimination).toEqual(byStrictElimination(after, before, counter));
});

test("elimination 2 - modus ponens", () => {
    let before = reducedImplies("a", "b");
    let after = symbol("b");
    let counter = symbol("a");
    let elimination = byElimination(after, before, counter);

    expect(elimination).toEqual(byStrictModusPonens(after, before, counter));
});

test("elimination 3 - modus tollens", () => {
    let before = reducedImplies("a", "b");
    let after = not("a");
    let counter = not("b")
    let elimination = byElimination(after, before, counter);

    expect(elimination).toEqual(byStrictModusTollens(after, before, counter));
});

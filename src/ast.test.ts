
import { areExprListsIdenticalUnordered } from "./ast"
import { not, symbol } from "./astExprMaker";

test("areExprsListsIdenticalUnordered test 1", () => {
    let aList = [symbol("a"), symbol("b"), symbol("c")];
    let bList = [symbol("c"), symbol("b"), symbol("a")];
    expect(areExprListsIdenticalUnordered(aList, bList)).toBe(true);
});

test("areExprsListsIdenticalUnordered test 2", () => {
    let aList = [symbol("a"), symbol("b"), symbol("c")];
    let bList = [symbol("b"), symbol("a"), symbol("c")];
    expect(areExprListsIdenticalUnordered(aList, bList)).toBe(true);
});


test("areExprsListsIdenticalUnordered test 3", () => {
    let aList = [not("a"), not("b"), not("c")];
    let bList = [not("b"), not("c"), not("a")];
    expect(areExprListsIdenticalUnordered(aList, bList)).toBe(true);
});

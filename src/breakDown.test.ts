
import { breakDown } from './breakDown';
import { and, symbol } from './astExprMaker';
import { bySpecialization } from './justification';

test("empty break down", () => {
    expect(breakDown([])).toEqual([]);
});

test("simple cannot break down", () => {
    let list = [
        symbol("unbreakable")
    ];

    expect(breakDown(list)).toEqual([...list]);
});

test("simple 'and' break down", () => {
    let expr1 = and("a", "b");
    let list = [expr1];

    expect(breakDown(list)).toEqual([
        ...list,
        bySpecialization(symbol("a"), expr1),
        bySpecialization(symbol("b"), expr1),
    ]);
});

test("simple 'and' break down nested", () => {
    let expr1 = and(and("a", "b"), and("c", "d"));
    let list = [expr1];

    expect(breakDown(list)).toEqual([
        ...list,
        bySpecialization(and("a", "b"), expr1),
        bySpecialization(and("c", "d"), expr1),
    ]);
});

test("simple partially redundant break down", () => {
    let expr1 = and("a", "b");
    let expr2 = and("c", "d");
    let list = [
        symbol("b"),
        expr1,
        expr2,
        symbol("c"),
    ];

    expect(breakDown(list)).toEqual([
        ...list,
        bySpecialization(symbol("a"), expr1),
        bySpecialization(symbol("d"), expr2),
    ]);
});

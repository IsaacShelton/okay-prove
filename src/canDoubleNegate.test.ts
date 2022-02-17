
import { not, or, symbol } from './astExprMaker';
import { canDoubleNegate } from './canDoubleNegate';

test("canDoubleNegate unable 1", () => {
    let from = symbol("a");
    let to = symbol("b");
    let result = canDoubleNegate(from, to);

    expect(result).toBeNull();
});

test("canDoubleNegate unable 2", () => {
    let from = symbol("a");
    let to = not("b");
    let result = canDoubleNegate(from, to);

    expect(result).toBeNull();
});

test("canDoubleNegate unable 3", () => {
    let from = not(not("a"));
    let to = not("b");
    let result = canDoubleNegate(from, to);

    expect(result).toBeNull();
});

test("canDoubleNegate unable 4", () => {
    let from = not("c");
    let to = not(or("c", "b"));
    let result = canDoubleNegate(from, to);

    expect(result).toBeNull();
});

// ---

test("canDoubleNegate able 1", () => {
    let from = symbol("a");
    let to = not(not("a"));
    let result = canDoubleNegate(from, to);

    expect(result).not.toBeNull();
});

test("canDoubleNegate able 2", () => {
    let from = not("a");
    let to = not(not(not("a")));
    let result = canDoubleNegate(from, to);

    expect(result).not.toBeNull();
});

test("canDoubleNegate able 3", () => {
    let from = not(not("a"));
    let to = symbol("a");
    let result = canDoubleNegate(from, to);

    expect(result).not.toBeNull();
});

test("canDoubleNegate able 4", () => {
    let from = not(not(not(or("a", "b"))));
    let to = not(or("a", "b"));
    let result = canDoubleNegate(from, to);

    expect(result).not.toBeNull();
});

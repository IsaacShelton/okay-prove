
import { and, not, or, symbol } from "./astExprMaker";
import { canAssociative } from "./canAssociative"
import { byAssociative } from "./justification";

test("canAssociative test unable 1", () => {
    let from = symbol("a");
    let to = not("a");
    expect(canAssociative(from, to)).toBeNull();
});

test("canAssociative test unable 2", () => {
    let from = or("a", "b");
    let to = not("a");
    expect(canAssociative(from, to)).toBeNull();
});

test("canAssociative test unable 3", () => {
    let from = and("a", not("b"));
    let to = not("a");
    expect(canAssociative(from, to)).toBeNull();
});

test("canAssociative test unable 4", () => {
    let from = symbol("a");
    let to = not(not("a"));
    expect(canAssociative(from, to)).toBeNull();
});

test("canAssociative test unable 5", () => {
    let from = or("a", "b");
    let to = and("b", "a");
    expect(canAssociative(from, to)).toBeNull();
});

test("canAssociative test unable 6", () => {
    let from = and("a", "b");
    let to = or("b", "a");
    expect(canAssociative(from, to)).toBeNull();
});

test("canAssociative test able 1", () => {
    let from = and("a", "b");
    let to = and("b", "a");

    expect(canAssociative(from, to)).toEqual(byAssociative(to, from));
});

test("canAssociative test able 2", () => {
    let from = or("a", "b");
    let to = or("b", "a");

    expect(canAssociative(from, to)).toEqual(byAssociative(to, from));
});

test("canAssociative test able 3", () => {
    let from = or("a", or("b", "c"));
    let to = or(or("a", "c"), "b");

    expect(canAssociative(from, to)).toEqual(byAssociative(to, from));
});

test("canAssociative test able 4", () => {
    let from = or("a", or("b", "c"));
    let to = or(or("b", "c"), "a");

    expect(canAssociative(from, to)).toEqual(byAssociative(to, from));
});

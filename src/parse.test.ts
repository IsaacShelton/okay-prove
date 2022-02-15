
import { Ast } from './ast';
import { ParseError } from './parse';
import { parseForTesting } from './testing';
import { implies, and, or, symbol, not } from './astExprMaker';

test("parse error on no content", () => {
    expect(parseForTesting("")).toBeInstanceOf(ParseError);
});

test("parse error on no conclusion", () => {
    expect(parseForTesting("\n\n\n\n\n\n\n")).toBeInstanceOf(ParseError);
});

test("parse only conclusion example 1 - no empty lines", () => {
    expect(parseForTesting("a and b implies c")).toEqual(new Ast(
        [],
        implies(and("a", "b"), "c")
    ));
});

test("parse only conclusion example 2 - empty lines", () => {
    expect(parseForTesting("\na and b implies c\n")).toEqual(new Ast(
        [],
        implies(and("a", "b"), "c")
    ));
});

test("parse only conclusion example 3 - left-to-right biased ordering", () => {
    expect(parseForTesting("a or b or c\n")).toEqual(new Ast(
        [],
        or(or("a", "b"), "c")
    ));
});

test("parse only conclusion example 4 - mixed operator left-to-right biased ordering", () => {
    expect(parseForTesting("a or b and c or d and e")).toEqual(new Ast(
        [],
        and(or(and(or("a", "b"), "c"), "d"), "e")
    ));
});

test("parse only conclusion example 5 - operator precedence of implies", () => {
    expect(parseForTesting("a and b implies c or d")).toEqual(new Ast(
        [],
        implies(and("a", "b"), or("c", "d"))
    ));
});

test("parse only conclusion example 6 - operator precedence of not", () => {
    expect(parseForTesting("not a or b or c or not d")).toEqual(new Ast(
        [],
        or(or(or(not("a"), "b"), "c"), not("d"))
    ));
});

test("parse only conclusion example 7 - precedence of grouping", () => {
    expect(parseForTesting("a and (b implies c) or d")).toEqual(new Ast(
        [],
        or(and("a", implies("b", "c")), "d")
    ));
});

test("parse only conclusion example 8 - multiple groups", () => {
    expect(parseForTesting("x implies (c implies q) or (a and b)")).toEqual(new Ast(
        [],
        implies("x", or(implies("c", "q"), and("a", "b")))
    ));
});

test("simple premise 1", () => {
    expect(parseForTesting("a\na")).toEqual(new Ast(
        [symbol("a")],
        symbol("a")
    ));
});

test("simple premise 2 - unnecessary whitespace", () => {
    expect(parseForTesting("\n\n  a  \n  a\n\n")).toEqual(new Ast(
        [symbol("a")],
        symbol("a")
    ));
});

test("simple premise 3 - expression as premise", () => {
    expect(parseForTesting("a and b\nb")).toEqual(new Ast(
        [and("a", "b")],
        symbol("b")
    ));
});

test("simple premise 4 - implication in premise", () => {
    expect(parseForTesting("a implies b\nnot a or b")).toEqual(new Ast(
        [implies("a", "b")],
        or(not("a"), "b")
    ));
});

test("multiple premises 1", () => {
    expect(parseForTesting("a implies b\nb implies c\na\nc")).toEqual(new Ast(
        [implies("a", "b"), implies("b", "c"), symbol("a")],
        symbol("c")
    ));
});

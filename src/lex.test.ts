
import { lex, TokenKind } from './lex';

test("lex 'next line' token", () => {
    expect(lex("\n")).toEqual([{ type: TokenKind.NextLine }]);
});

test("lex 'open' token", () => {
    expect(lex("(")).toEqual([{ type: TokenKind.Open }]);
});

test("lex 'close' token", () => {
    expect(lex(")")).toEqual([{ type: TokenKind.Close }]);
});

test("lex 'not' token", () => {
    expect(lex("not")).toEqual([{ type: TokenKind.Not }]);
});

test("lex 'and' token", () => {
    expect(lex("and")).toEqual([{ type: TokenKind.And }]);
});

test("lex 'or' token", () => {
    expect(lex("or")).toEqual([{ type: TokenKind.Or }]);
});

test("lex short 'symbol' token", () => {
    expect(lex("a")).toEqual([{ type: TokenKind.Symbol, name: "a" }]);
});

test("lex long 'symbol' token", () => {
    expect(lex("a_longer_name")).toEqual([{ type: TokenKind.Symbol, name: "a_longer_name" }]);
});

test("lex single line example 1", () => {
    expect(lex("a and b")).toEqual([
        { type: TokenKind.Symbol, name: "a" },
        { type: TokenKind.And },
        { type: TokenKind.Symbol, name: "b" },
    ]);
});

test("lex single line example 2", () => {
    expect(lex("not (a or b)")).toEqual([
        { type: TokenKind.Not },
        { type: TokenKind.Open },
        { type: TokenKind.Symbol, name: "a" },
        { type: TokenKind.Or },
        { type: TokenKind.Symbol, name: "b" },
        { type: TokenKind.Close },
    ]);
});

test("lex single line example 3", () => {
    expect(lex("\nx implies y or z\n")).toEqual([
        { type: TokenKind.NextLine },
        { type: TokenKind.Symbol, name: "x" },
        { type: TokenKind.Implies },
        { type: TokenKind.Symbol, name: "y" },
        { type: TokenKind.Or },
        { type: TokenKind.Symbol, name: "z" },
        { type: TokenKind.NextLine },
    ]);
});

test("lex program example 1", () => {
    expect(lex(`
        a implies not b
        b and c
        not a
    `)).toEqual([
        { type: TokenKind.NextLine },
        { type: TokenKind.Symbol, name: "a" },
        { type: TokenKind.Implies },
        { type: TokenKind.Not },
        { type: TokenKind.Symbol, name: "b" },
        { type: TokenKind.NextLine },
        { type: TokenKind.Symbol, name: "b" },
        { type: TokenKind.And },
        { type: TokenKind.Symbol, name: "c" },
        { type: TokenKind.NextLine },
        { type: TokenKind.Not },
        { type: TokenKind.Symbol, name: "a" },
        { type: TokenKind.NextLine },
    ]);
});

test("lex program example 2", () => {
    expect(lex(`
        q implies u
        r implies u
        s implies u
        q or r or s
        u
    `)).toEqual([
        { type: TokenKind.NextLine },
        { type: TokenKind.Symbol, name: "q" },
        { type: TokenKind.Implies },
        { type: TokenKind.Symbol, name: "u" },
        { type: TokenKind.NextLine },
        { type: TokenKind.Symbol, name: "r" },
        { type: TokenKind.Implies },
        { type: TokenKind.Symbol, name: "u" },
        { type: TokenKind.NextLine },
        { type: TokenKind.Symbol, name: "s" },
        { type: TokenKind.Implies },
        { type: TokenKind.Symbol, name: "u" },
        { type: TokenKind.NextLine },
        { type: TokenKind.Symbol, name: "q" },
        { type: TokenKind.Or },
        { type: TokenKind.Symbol, name: "r" },
        { type: TokenKind.Or },
        { type: TokenKind.Symbol, name: "s" },
        { type: TokenKind.NextLine },
        { type: TokenKind.Symbol, name: "u" },
        { type: TokenKind.NextLine },
    ]);
});

test("lex program example 2", () => {
    expect(lex(`
        p or q
        not p
        q
    `)).toEqual([
        { type: TokenKind.NextLine },
        { type: TokenKind.Symbol, name: "p" },
        { type: TokenKind.Or },
        { type: TokenKind.Symbol, name: "q" },
        { type: TokenKind.NextLine },
        { type: TokenKind.Not },
        { type: TokenKind.Symbol, name: "p" },
        { type: TokenKind.NextLine },
        { type: TokenKind.Symbol, name: "q" },
        { type: TokenKind.NextLine },
    ]);
});

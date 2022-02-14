
import { lex, TokenKind } from './lex';

test("lex 'open' token", () => {
    expect(lex("(")).toEqual([{ type: TokenKind.Open }])
});

test("lex 'close' token", () => {
    expect(lex(")")).toEqual([{ type: TokenKind.Close }])
});

test("lex 'not' token", () => {
    expect(lex("not")).toEqual([{ type: TokenKind.Not }])
});

test("lex 'and' token", () => {
    expect(lex("and")).toEqual([{ type: TokenKind.And }])
});

test("lex 'or' token", () => {
    expect(lex("or")).toEqual([{ type: TokenKind.Or }])
});

test("lex short 'symbol' token", () => {
    expect(lex("a")).toEqual([{ type: TokenKind.Symbol, name: "a" }])
});

test("lex long 'symbol' token", () => {
    expect(lex("a_longer_name")).toEqual([{ type: TokenKind.Symbol, name: "a_longer_name" }])
});

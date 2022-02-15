
import { parse, ParseError, Ast } from './parse';
import { lex, LexError } from './lex';

function parseForTesting(content: string): Ast | ParseError {
    let tokens = lex(content);
    let result: Ast | ParseError;

    if (tokens instanceof LexError) {
        fail();
    } else {
        result = parse(tokens);
    }

    return result;
}

test("parse error on no content", () => {
    expect(parseForTesting("")).toBeInstanceOf(ParseError);
});

test("parse error on no conclusion", () => {
    expect(parseForTesting("\n\n\n\n\n\n\n")).toBeInstanceOf(ParseError);
});

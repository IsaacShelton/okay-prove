
import { Ast } from './ast';
import { parse, ParseError } from './parse';
import { lex, LexError } from './lex';
import { okayProve } from './okayProve';

export function parseForTesting(content: string): Ast | ParseError {
    let tokens = lex(content);

    if (tokens instanceof LexError) {
        fail();
    } else {
        return parse(tokens);
    }
}

export function parseOrFail(content: string): Ast {
    let tokens = lex(content);

    if (tokens instanceof LexError) {
        fail();
    }

    let ast = parse(tokens);

    if (ast instanceof ParseError) {
        fail();
    }

    return ast;
}

export function expectProvable(prompt: string) {
    expect(okayProve(parseOrFail(prompt))).not.toBeNull();
}
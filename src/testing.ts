
import { Ast } from './ast';
import { parse, ParseError } from './parse';
import { lex, LexError } from './lex';

export function parseForTesting(content: string): Ast | ParseError {
    let tokens = lex(content);

    if (tokens instanceof LexError) {
        fail();
    } else {
        return parse(tokens);
    }
}

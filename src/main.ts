
import fs from 'fs';
import { exit } from 'process';
import { lex, LexError } from './lex';
import { okayProve } from "./okayProve";
import { parse, ParseError } from './parse';
import { visualizeProof } from './visualize';

export function main(filename: string, options: any[]) {
    let contents;

    try {
        contents = fs.readFileSync(filename, "utf-8");
    } catch (err) {
        console.error("Failed to open file '" + filename + "'");
        exit(1);
    }

    let tokens = lex(contents);

    if (tokens instanceof LexError) {
        console.error(tokens.name + ': ' + tokens.message);
        exit(1);
    }

    let ast = parse(tokens);

    if (ast instanceof ParseError) {
        console.error(ast.name + ': ' + ast.message);
        exit(1);
    }

    let result = okayProve(ast);

    if (result == null) {
        console.error("Could not prove ;(");
    } else {
        console.log(visualizeProof(result));
    }
}

#!/usr/bin/env node

import fs from 'fs';
import { Command } from 'commander';
import { exit } from 'process';
import { okayProve } from './okayProve';
import { lex, LexError } from './lex';
import { parse, ParseError } from './parse';

let program = new Command();

program
    .name("okay-prove")
    .version('0.0.1')
    .description("A CLI for automatically generating logical proofs")
    .argument("<filename>", "file with premises and conclusion")
    .action((filename, options) => {
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

        okayProve(ast);
    })
    .parse(process.argv);

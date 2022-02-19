#!/usr/bin/env node

import { Command, Option } from 'commander';
import { main } from './main';

let program = new Command();

program
    .name('okay-prove')
    .version('0.0.1')
    .description('A CLI tool for automatically generating logical proofs')
    .argument('<filename>', 'file with premises and conclusion')
    .option('-t, --trace', 'output known facts if unable to prove')
    .addOption(new Option('-f, --format <value>', "display format of proof").choices(['cascade', 'inline', 'latex', 'collapse']).default('inline'))
    .action(main)
    .parse(process.argv);

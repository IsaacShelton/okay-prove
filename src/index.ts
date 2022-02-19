#!/usr/bin/env node

import { Command } from 'commander';
import { main } from './main';

let program = new Command();

program
    .name('okay-prove')
    .version('0.0.1')
    .description('A CLI for automatically generating logical proofs')
    .argument('<filename>', 'file with premises and conclusion')
    .option('-t, --trace', 'output known facts if unable to prove')
    .action(main)
    .parse(process.argv);

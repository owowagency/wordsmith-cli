#!/usr/bin/env node
import figlet from 'figlet';
import { Command } from 'commander';
import { version } from '../package.json';
import { command } from '@/commands/pull';

console.log(figlet.textSync('Wordsmith CLI'));

const program = new Command();

program
    .name('Wordsmith CLI')
    .version(version)
    .description('Wordsmith CLI to pull and push content from Wordsmith.')
    .addCommand(command)
    .parse();

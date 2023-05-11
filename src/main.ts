#!/usr/bin/env node

import 'dotenv/config';
import figlet from 'figlet';
import { Command } from 'commander';
import { version } from '../package.json';
import init from '@/commands/init';
import pull from '@/commands/pull';
import push from '@/commands/push';

console.log(figlet.textSync('Wordsmith CLI'));

const program = new Command()
    .name('Wordsmith CLI')
    .version(version)
    .description('Wordsmith CLI to pull and push content from Wordsmith.');

init.bind(program);
pull.bind(program);
push.bind(program);

program.parse();

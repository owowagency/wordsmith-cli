import { writeFileSync } from 'node:fs';
import inquirer from 'inquirer';
import type { Command } from 'commander';
import chalk from 'chalk';
import yaml from 'yaml';

export default <SubCommand>{
    bind(command: Command) {
        command
            .command('init')
            .description('Initialise Wordsmith.')
            .summary('Creates Wordsmith config file')
            .action(() => {
                inquirer
                    .prompt([
                        {
                            type: 'input',
                            name: 'projectId',
                            message: 'Project ID:',
                            validate(input: string) {
                                return !!input.trim();
                            },
                        },
                        {
                            type: 'input',
                            name: 'token',
                            message: 'API Key:',
                            validate(input: string) {
                                return !!input.trim();
                            },
                        },

                        // TODO: Interactive way to create targets?
                    ])
                    .then((answers) => {
                        writeFileSync(process.env.CONFIG_FILE || '', yaml.stringify(answers));

                        console.log(chalk.green(`${process.env.CONFIG_FILE} file has been created. 🚀`));
                    });
            });
    },
};

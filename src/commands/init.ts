import { writeFileSync } from 'node:fs';
import inquirer from 'inquirer';
import type { Command } from 'commander';
import chalk from 'chalk';
import { TranslationType } from '@/misc/enums';

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
                            type: 'list',
                            name: 'type',
                            message: 'File format:',
                            choices: [
                                TranslationType.I18Next,
                                TranslationType.JSON,
                            ],
                        },
                        {
                            type: 'input',
                            name: 'langDir',
                            message: 'Language folder:',
                            default: 'lang',
                        },
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
                            name: 'apiKey',
                            message: 'API Key:',
                            validate(input: string) {
                                return !!input.trim();
                            },
                        },
                    ])
                    .then((answers) => {
                        writeFileSync(process.env.CONFIG_FILE || '', JSON.stringify(answers, null, 4));

                        console.log(chalk.green(`${process.env.CONFIG_FILE} file has been created. 🚀`));
                    });
            });
    },
};

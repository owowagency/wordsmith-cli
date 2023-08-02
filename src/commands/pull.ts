import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import chalk from 'chalk';
import type { Command } from 'commander';
import yaml from 'yaml';
import { verifyConfigFile } from '@/misc/actions';
import Translatable from '@/contracts/translation';
import { TargetType } from '@/misc/enums';

interface PullOptions {
    env: string
}

function loadEnv(env: string): Config {
    const src = readFileSync(env).toString();

    return yaml.parse(src);
}

export default <SubCommand>{
    bind(command: Command) {
        command
            .command('pull')
            .description('Pull content from Wordsmith.')
            .summary('Pulls content from Wordsmith')
            .option('-e, --env <env>', 'Environment file', 'wordsmith.yml')
            .action(async ({ env }: PullOptions) => {
                verifyConfigFile();
                const config = loadEnv(env);
                const targets = config.targets.filter((target: Target) => target.types.includes(TargetType.Pull));
                const contract = new Translatable(config.token);

                // TODO: Get from API?
                const defaults = {
                    locales: ['en', 'nl', 'fr'],
                    defaultLocale: 'en',
                };

                for (const target of targets) {
                    for (const locale of defaults.locales) {
                        let output = target.file;

                        if (defaults.defaultLocale === locale && !!target.defaultLocaleOverride) {
                            output = target.defaultLocaleOverride;
                        }

                        output = output.replace('{locale}', locale);
                        console.log(chalk.blueBright(`[${locale.toUpperCase()}]`), `Pulling into ${output}`);

                        try {
                            const data = await contract.pull(config.projectId, locale, target.args.fileType, target.args.tags || []);
                            console.log(chalk.blueBright(`[${locale.toUpperCase()}]`), 'pulled successfully');

                            if (!existsSync(output)) {
                                mkdirSync(dirname(output), { recursive: true });
                            }

                            writeFileSync(output, data);
                        } catch (e) {
                            console.log(chalk.redBright(`[${locale.toUpperCase()}]`), 'operation failed', e);
                        }
                    }
                }
            });
    },
};

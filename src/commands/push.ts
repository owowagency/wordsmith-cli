import { readFileSync } from 'node:fs';
import type { Command } from 'commander';
import chalk from 'chalk';
import yaml from 'yaml';
import { verifyConfigFile } from '@/misc/actions';
import Translatable from '@/contracts/translation';
import { TargetType } from '@/misc/enums';

export interface PushOptions {
    env: string
    overwrite: boolean
    verify: boolean
}

function loadEnv(env: string): Config {
    const src = readFileSync(env).toString();

    return yaml.parse(src);
}

export default <SubCommand>{
    bind(command: Command) {
        command
            .command('push')
            .description('Push content to Wordsmith.')
            .summary('Push content to Wordsmith')
            .option('-e, --env <env>', 'Environment file', 'wordsmith.yml')
            .option('-f, --force <overwrite>', 'Overwrite existing translations', false)
            .option('-v, --verify <verify>', 'Verify translations', false)
            .action(async ({ env, overwrite, verify }: PushOptions) => {
                verifyConfigFile();
                const config = loadEnv(env);
                const targets = config.targets.filter((target: Target) => target.types.includes(TargetType.Push));
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

                        console.log(chalk.blueBright(`[${locale.toUpperCase()}]`), `Pushing ${output}`);
                        try {
                            await contract.push(
                                config.projectId,
                                locale,
                                target.args.fileType,
                                output,
                                target.args.tags || [],
                                { overwrite, verify },
                            );
                            console.log(chalk.blueBright(`[${locale.toUpperCase()}]`), 'pushed successfully');
                        } catch (e) {
                            console.log(chalk.redBright(`[${locale.toUpperCase()}]`), 'operation failed', e);
                        }
                    }
                }
            });
    },
};

import chalk from 'chalk';
import type { Command } from 'commander';
import { verifyConfigFile } from '@/misc/actions';
import JSONFormat from '@/formats/json';

interface PullOptionas {
    languages: string
    tags?: string
}

export default <SubCommand>{
    bind(command: Command) {
        command
            .command('pull')
            .description('Pull content from Wordsmith.')
            .summary('Pulls content from Wordsmith')
            .requiredOption('-l, --languages <languages>', 'Comma seperated list of ISO 639-1 language codes.')
            .action(async ({ languages }: PullOptionas) => {
                verifyConfigFile();

                // @todo: for now we only have one formatter, we can get correct formatter from type for later
                const formatter = new JSONFormat();

                const langs = languages.split(',').map(item => item.trim()).filter(item => item);

                for (const language of langs) {
                    const isSuccess = await formatter.pull(language);

                    if (isSuccess) {
                        console.log(chalk.blueBright(`[${language.toUpperCase()}]`), 'pulled successfully');
                    } else {
                        console.log(chalk.redBright(`[${language.toUpperCase()}]`), 'operation failed');
                    }
                }
            });
    },
};

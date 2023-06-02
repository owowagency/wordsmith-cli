import type { Command } from 'commander';
import chalk from 'chalk';
import { verifyConfigFile } from '@/misc/actions';
import JSONFormat from '@/formats/json';

export interface PushOptions {
    languages?: string
    overwrite?: boolean
    verify?: boolean
}

export default <SubCommand>{
    bind(command: Command) {
        command
            .command('push')
            .description('Push content to Wordsmith.')
            .summary('Push content to Wordsmith')
            .option('-l, --languages <languages>', 'Comma seperated list of ISO 639-1 language codes. Will push all languages if not specified')
            .action(async (options: PushOptions) => {
                verifyConfigFile();

                // @todo: for now we only have one formatter, we can get correct formatter from type for later
                const formatter = new JSONFormat();

                const files = formatter.files.filter(
                    item => options.languages
                        ? options.languages?.split(',').map(item => item.trim()).includes(item.name)
                        : true,
                );

                for (const file of files) {
                    const isSuccess = await formatter.push(file);

                    if (isSuccess) {
                        console.log(chalk.blueBright(`[${file.name.toUpperCase()}]`), 'pushed successfully');
                    } else {
                        console.log(chalk.redBright(`[${file.name.toUpperCase()}]`), 'operation failed');
                    }
                }
            });
    },
};

import fs from 'node:fs';
import path from 'node:path';
import type { Command } from 'commander';
import chalk from 'chalk';
import { verifyConfigFile } from '@/misc/actions';
import JSONFormat from '@/formats/json';

interface PushOptionas {
    languages?: string
}

export default <SubCommand>{
    bind(command: Command) {
        command
            .command('push')
            .description('Push content to Wordsmith.')
            .summary('Push content to Wordsmith')
            .option('-l, --languages <languages>', 'Comma seperated list of ISO 639-1 language codes.')
            .action(async (options: PushOptionas) => {
                verifyConfigFile();

                // @todo: for now we only have one formatter, we can get correct formatter from type for later
                const formatter = new JSONFormat();

                const files = formatter.files.filter(
                    item => options.languages
                        ? options.languages?.split(',').map(item => item.trim()).includes(item.name)
                        : true,
                );

                for (const file of files) {
                    const content = fs.readFileSync(path.resolve(formatter.config.langDir, `${file.name}${file.ext}`));

                    await formatter.push(content, `${file.name}${file.ext}`);

                    console.log(chalk.blueBright(`[${file.name.toUpperCase()}]`), 'content pushed');
                }
            });
    },
};

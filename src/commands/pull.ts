import fs from 'node:fs';
import path from 'node:path';
import type { Command } from 'commander';
import chalk from 'chalk';
import { verifyConfigFile } from '@/misc/actions';
import JSONFormat from '@/formats/json';

interface PullOptionas {
    languages?: string
    tags?: string
}

export default <SubCommand>{
    bind(command: Command) {
        command
            .command('pull')
            .description('Pull content from Wordsmith.')
            .summary('Pulls content from Wordsmith')
            .option('-l, --languages <languages>', 'Comma seperated list of ISO 639-1 language codes.')
            .option('-a, --tags <tags>', 'Comma seperated list of tags to import.')
            .action(async ({ languages, tags }: PullOptionas) => {
                verifyConfigFile();

                // @todo: for now we only have one formatter, we can get correct formatter from type for later
                const formatter = new JSONFormat();

                const translations = await formatter.pull(languages, tags);

                const collection: Record<string, TranslatableRecord[]> = {};

                for (const translation of translations) {
                    for (const { language, value } of translation.translationValues) {
                        if (!collection[language]) {
                            collection[language] = [];
                        }

                        collection[language].push({ key: translation.key, value });
                    }
                }

                for (const lang in collection) {
                    const content = formatter.serialize(collection[lang]);

                    fs.writeFileSync(
                        path.resolve(formatter.config.langDir, `${lang}.${formatter.extension}`),
                        content,
                    );

                    console.log(chalk.blueBright(`[${lang.toUpperCase()}]`), 'content pulled');
                }
            });
    },
};

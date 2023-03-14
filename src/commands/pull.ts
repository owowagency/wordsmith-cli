import { Command } from 'commander';
import figlet from 'figlet';
import {TranslationService} from '../translation-service.js';
import {Config} from '../misc/config.js';
import {Storage} from '../filesystem/storage.js';

const config = new Config();

export const test = async () => {
    const program = new Command();

    console.log(figlet.textSync('Wordsmith CLI'));

    program
        .version('0.0.1')
        .description('Wordsmith CLI to pull and push content from Wordsmith.');

    program.command('pull')
        .description('Pull content from Wordsmith.')
        .option('-t, --type <type>', 'The type which needs to be used to export the translation to.')
        .option('-l, --languages <languages>', 'Comma seperated list of ISO 639-1 language codes.')
        .option('-a, --tags <tags>', 'Comma seperated list of tags to import.')
        .action(async (data) => {
            const options = config.forPull(data);

            const translationService = new TranslationService();

            const translations = await translationService.pull(options);

            const storage = new Storage();

            storage.store(translations, options);
        });

    program.parse(process.argv);
};

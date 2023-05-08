import { Command } from 'commander';

export const command = new Command('pull');

command.command('pull')
    .description('Pull content from Wordsmith.')
    .option('-t, --type <type>', 'The type which needs to be used to export the translation to.')
    .option('-l, --languages <languages>', 'Comma seperated list of ISO 639-1 language codes.')
    .option('-a, --tags <tags>', 'Comma seperated list of tags to import.')
    .action((data) => {
        console.log('baris', data);
    });

import {CLI} from "./CLI";

const { program } = require("commander");
const packageJson = require('../package.json');

import { Repository } from "./Repository";
import { Config } from './Config';

program
    .name('translate')
    .description(packageJson.description)
    .version(packageJson.version)
    .option('-token, --api-token <token>', 'Set the token used to authenticate with the API')
    .option('-id, --project-id <id>', 'Set the ID of the project that will be used for translations')
    .option('-d, --translations-directory <directory>', 'Set the directory where the translations will be stored')
    .option('-t --tags <tags>', 'Set the tags that will be used to filter the translations');

let config = new Config();

let repository = new Repository(config);

program
    .command('pull')
    .description('Pull translations from the repository')
    .action(() => CLI.pull(repository, config));

program
    .command('push')
    .description('Push translations to the repository')
    .action(() => CLI.push(repository, config));

program.parse(process.argv);

const options = program.opts();

if (options.apiToken) { config.set('api_token', options.apiToken); }

if (options.projectId) { config.set('project_id', options.projectId); }

if (options.translationsDirectory) { config.set('translations_directory', options.translationsDirectory); }

if (options.tags) { config.set('tags', options.tags); }

if (! config.isConfigured()) {
    console.log("Please configure the CLI before using it.");
    program.help();
}